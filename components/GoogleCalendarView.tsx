"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckSquare,
  GripVertical,
  Search,
  Plus,
  ExternalLink,
  Wifi,
  WifiOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useTheme } from "./AppLayout";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink: string;
}

interface UnifiedEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  type: "app" | "google";
  htmlLink?: string;
  projectName?: string;
  projectColor?: string;
}

interface GoogleCalendarViewProps {
  className?: string;
}

declare global {
  interface Window {
    gapi: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    google: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

// Memoization utility for preventing race conditions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const memoize = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  maxAge: number = 60000,
) => {
  const cache = new Map();

  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const key = JSON.stringify(args);
    const now = Date.now();

    if (cache.has(key)) {
      const { value, timestamp } = cache.get(key);
      if (now - timestamp < maxAge) {
        return value;
      }
      cache.delete(key);
    }

    const promise = fn(...args);
    cache.set(key, { value: promise, timestamp: now });

    try {
      const result = await promise;
      cache.set(key, { value: result, timestamp: now });
      return result;
    } catch (error) {
      cache.delete(key);
      throw error;
    }
  };
};

class GoogleCalendarClient {
  private static instance: GoogleCalendarClient;
  private gapi: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
  private tokenClient: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
  private isInitialized = false;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;
  private initializationPromise: Promise<boolean> | null = null;

  static getInstance(): GoogleCalendarClient {
    if (!GoogleCalendarClient.instance) {
      GoogleCalendarClient.instance = new GoogleCalendarClient();
    }
    return GoogleCalendarClient.instance;
  }

  async initialize(): Promise<boolean> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._initialize();
    return this.initializationPromise;
  }

  private async _initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Load stored tokens
      this.loadStoredTokens();

      // Load Google APIs
      await this.loadScript("https://apis.google.com/js/api.js");
      await this.loadScript("https://accounts.google.com/gsi/client");

      await new Promise<void>((resolve, reject) => {
        window.gapi.load("client", {
          callback: resolve,
          onerror: reject,
        });
      });

      await window.gapi.client.init({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
        discoveryDocs: [
          "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
        ],
      });

      // Store gapi reference for later use
      this.gapi = window.gapi;

      // Initialize Google Identity Services
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/calendar.readonly",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (response: any) => {
          if (response.access_token) {
            this.accessToken = response.access_token;
            this.tokenExpiry = Date.now() + response.expires_in * 1000;
            this.storeTokens();
            this.gapi.client.setToken({
              access_token: response.access_token,
            });
          }
        },
      });

      this.isInitialized = true;

      // If we have stored tokens, try to use them
      if (this.accessToken && this.isTokenValid()) {
        this.gapi.client.setToken({
          access_token: this.accessToken,
        });
      }

      return true;
    } catch (error) {
      console.error("Failed to initialize Google Calendar:", error);
      this.isInitialized = false;
      this.initializationPromise = null;
      return false;
    }
  }

  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  private loadStoredTokens(): void {
    try {
      const storedData = localStorage.getItem("google_calendar_tokens");
      if (storedData) {
        const { accessToken, refreshToken, tokenExpiry } =
          JSON.parse(storedData);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiry = tokenExpiry;
      }
    } catch (error) {
      console.warn("Failed to load stored tokens:", error);
      this.clearStoredTokens();
    }
  }

  private storeTokens(): void {
    try {
      const tokenData = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        tokenExpiry: this.tokenExpiry,
        timestamp: Date.now(),
      };
      localStorage.setItem("google_calendar_tokens", JSON.stringify(tokenData));
    } catch (error) {
      console.warn("Failed to store tokens:", error);
    }
  }

  private clearStoredTokens(): void {
    try {
      localStorage.removeItem("google_calendar_tokens");
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = null;
    } catch (error) {
      console.warn("Failed to clear stored tokens:", error);
    }
  }

  private isTokenValid(): boolean {
    if (!this.accessToken || !this.tokenExpiry) return false;
    // Add 5 minute buffer for token expiry
    return Date.now() < this.tokenExpiry - 5 * 60 * 1000;
  }

  async signIn(): Promise<boolean> {
    if (!this.isInitialized || !this.tokenClient || !this.gapi) return false;

    // Check if we already have valid tokens
    if (this.isTokenValid()) {
      this.gapi.client.setToken({
        access_token: this.accessToken,
      });
      return true;
    }

    return new Promise((resolve) => {
      const originalCallback = this.tokenClient.callback;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.tokenClient.callback = (response: any) => {
        originalCallback(response);
        resolve(!!response.access_token);
      };

      this.tokenClient.requestAccessToken();
    });
  }

  signOut(): void {
    this.clearStoredTokens();
    if (this.gapi?.client?.setToken) {
      this.gapi.client.setToken(null);
    }
  }

  // Memoized getEvents to prevent race conditions
  private _getEvents = memoize(
    async (
      timeMin: string,
      timeMax: string,
    ): Promise<GoogleCalendarEvent[]> => {
      if (!this.isInitialized || !this.gapi) {
        console.warn("Google Calendar not initialized");
        return [];
      }

      // Check token validity before making request
      if (!this.isTokenValid()) {
        throw new Error("TOKEN_EXPIRED");
      }

      try {
        // Additional safety check for gapi.client
        if (!this.gapi.client || !this.gapi.client.calendar) {
          console.error("Google Calendar API client not properly initialized");
          throw new Error("API_NOT_INITIALIZED");
        }

        const response = await this.gapi.client.calendar.events.list({
          calendarId: "primary",
          timeMin,
          timeMax,
          showDeleted: false,
          singleEvents: true,
          maxResults: 50,
          orderBy: "startTime",
        });

        return response.result.items || [];
      } catch (error: unknown) {
        // Handle specific API errors
        const apiError = error as { status?: number; result?: any }; // eslint-disable-line @typescript-eslint/no-explicit-any
        if (apiError.status === 403) {
          console.error("Google Calendar API access denied. Please check:");
          console.error(
            "1. Google Calendar API is enabled in Google Cloud Console",
          );
          console.error(
            "2. Your API key has permission to access Calendar API",
          );
          console.error("3. Your API key restrictions allow Calendar API");
          console.error("Full error:", error);
          throw new Error("API_ACCESS_DENIED");
        }

        if (apiError.status === 401) {
          // Token expired, clear stored tokens
          this.clearStoredTokens();
          throw new Error("TOKEN_EXPIRED");
        }

        console.error("Failed to fetch Google Calendar events:", error);
        throw error;
      }
    },
  );

  async getEvents(
    timeMin: string,
    timeMax: string,
  ): Promise<GoogleCalendarEvent[]> {
    return this._getEvents(timeMin, timeMax);
  }

  isSignedIn(): boolean {
    return this.isInitialized && this.isTokenValid();
  }
}

export default function GoogleCalendarView({
  className = "",
}: GoogleCalendarViewProps) {
  const { isDarkMode } = useTheme();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] =
    useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [googleCalendarError, setGoogleCalendarError] = useState<string | null>(
    null,
  );
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const [draggedTask, setDraggedTask] = useState<{
    id: string;
    title: string;
    description?: string;
    taskId: Id<"tasks">;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const calendarScrollRef = useRef<HTMLDivElement>(null);
  const googleCalendar = useRef(GoogleCalendarClient.getInstance());

  // Get week start (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentWeek);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    return {
      name: day.toLocaleDateString("en-US", { weekday: "long" }),
      short: day.toLocaleDateString("en-US", { weekday: "short" }),
      date: day.getDate(),
      fullDate: day,
    };
  });

  // Current week display string
  const currentWeekDisplay = (() => {
    const start = weekStart;
    const end = new Date(weekStart);
    end.setDate(start.getDate() + 6);

    return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${end.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`;
  })();

  // Convex queries
  const startDate = weekStart.getTime();
  const endDate = new Date(
    weekStart.getTime() + 7 * 24 * 60 * 60 * 1000,
  ).getTime();
  const eventsData = useQuery(api.calendar.getEvents, { startDate, endDate });
  const unscheduledTasks = useQuery(api.tasks.getUnscheduledTasks);
  const createEvent = useMutation(api.calendar.createEvent);

  // Time slots for calendar
  const timeSlots = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
  ];

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll to current time on mount
  useEffect(() => {
    if (calendarScrollRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const timePosition = getTimePosition(
        `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`,
      );
      const scrollContainer = calendarScrollRef.current;
      const containerHeight = scrollContainer.clientHeight;
      const scrollTo = Math.max(0, timePosition - containerHeight / 2);

      setTimeout(() => {
        scrollContainer.scrollTo({
          top: scrollTo,
          behavior: "smooth",
        });
      }, 100);
    }
  }, []);

  // Initialize Google Calendar
  useEffect(() => {
    const initGoogle = async () => {
      setConnectionStatus("connecting");
      try {
        const initialized = await googleCalendar.current.initialize();
        if (initialized) {
          const isSignedIn = googleCalendar.current.isSignedIn();
          setIsGoogleCalendarConnected(isSignedIn);
          setConnectionStatus(isSignedIn ? "connected" : "disconnected");
        } else {
          setConnectionStatus("error");
        }
      } catch (error) {
        console.error("Failed to initialize Google Calendar:", error);
        setConnectionStatus("error");
      }
    };
    initGoogle();
  }, []);

  // Fetch Google Calendar events when week changes or connection status changes
  useEffect(() => {
    const fetchGoogleEvents = async () => {
      if (!isGoogleCalendarConnected || googleCalendarError) return;

      setIsLoadingGoogle(true);
      setGoogleCalendarError(null);
      try {
        const timeMin = weekStart.toISOString();
        const timeMax = new Date(
          weekStart.getTime() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString();
        const events = await googleCalendar.current.getEvents(timeMin, timeMax);
        setGoogleEvents(events);
      } catch (error) {
        console.error("Failed to fetch Google Calendar events:", error);
        if (error instanceof Error) {
          if (error.message === "API_ACCESS_DENIED") {
            setGoogleCalendarError(
              "Google Calendar API access denied. Please enable the Calendar API in Google Cloud Console and check your API key permissions.",
            );
          } else if (error.message === "TOKEN_EXPIRED") {
            setGoogleCalendarError(
              "Session expired. Please reconnect to Google Calendar.",
            );
            setIsGoogleCalendarConnected(false);
            setConnectionStatus("disconnected");
          } else if (error.message === "API_NOT_INITIALIZED") {
            setGoogleCalendarError(
              "Google Calendar API not properly initialized. Please refresh the page and try again.",
            );
            setIsGoogleCalendarConnected(false);
            setConnectionStatus("error");
          } else {
            setGoogleCalendarError(
              "Failed to load Google Calendar events. Please check your connection.",
            );
          }
        }
      } finally {
        setIsLoadingGoogle(false);
      }
    };

    fetchGoogleEvents();
  }, [currentWeek, isGoogleCalendarConnected, weekStart, googleCalendarError]);

  // Connect to Google Calendar
  const handleConnectGoogle = async () => {
    setIsLoadingGoogle(true);
    setGoogleCalendarError(null);
    setConnectionStatus("connecting");

    try {
      const success = await googleCalendar.current.signIn();
      setIsGoogleCalendarConnected(success);
      setConnectionStatus(success ? "connected" : "error");

      if (success) {
        // Fetch events after successful connection
        const timeMin = weekStart.toISOString();
        const timeMax = new Date(
          weekStart.getTime() + 7 * 24 * 60 * 60 * 1000,
        ).toISOString();
        const events = await googleCalendar.current.getEvents(timeMin, timeMax);
        setGoogleEvents(events);
      } else {
        setGoogleCalendarError(
          "Failed to connect to Google Calendar. Please try again.",
        );
      }
    } catch (error) {
      console.error("Failed to connect to Google Calendar:", error);
      setConnectionStatus("error");

      if (error instanceof Error) {
        if (error.message === "API_NOT_INITIALIZED") {
          setGoogleCalendarError(
            "Google Calendar API not properly initialized. Please refresh the page and try again.",
          );
        } else if (error.message === "API_ACCESS_DENIED") {
          setGoogleCalendarError(
            "Google Calendar API access denied. Please check your API configuration.",
          );
        } else {
          setGoogleCalendarError(
            "Failed to connect to Google Calendar. Please check your configuration.",
          );
        }
      } else {
        setGoogleCalendarError(
          "Failed to connect to Google Calendar. Please check your configuration.",
        );
      }
    } finally {
      setIsLoadingGoogle(false);
    }
  };

  // Disconnect from Google Calendar
  const handleDisconnectGoogle = () => {
    googleCalendar.current.signOut();
    setIsGoogleCalendarConnected(false);
    setConnectionStatus("disconnected");
    setGoogleEvents([]);
    setGoogleCalendarError(null);
  };

  // Convert events to unified format
  const allEvents: UnifiedEvent[] = [];

  // Add app events
  if (eventsData) {
    eventsData.forEach((event) => {
      allEvents.push({
        id: event._id,
        title: event.title,
        description: event.description,
        startTime: new Date(event.startDate),
        endTime: new Date(event.endDate),
        allDay: event.allDay,
        type: "app",
        projectColor: event.project?.color,
        projectName: event.project?.name,
      });
    });
  }

  // Add Google Calendar events
  googleEvents.forEach((event) => {
    const startTime = event.start.dateTime
      ? new Date(event.start.dateTime)
      : new Date(event.start.date + "T00:00:00");
    const endTime = event.end.dateTime
      ? new Date(event.end.dateTime)
      : new Date(event.end.date + "T23:59:59");

    allEvents.push({
      id: `google-${event.id}`,
      title: event.summary || "Untitled Event",
      description: event.description,
      startTime,
      endTime,
      allDay: !event.start.dateTime,
      type: "google",
      htmlLink: event.htmlLink,
    });
  });

  // Group events by day
  const eventsByDay = weekDays.map((day) => {
    const dayEvents = allEvents.filter((event) => {
      const eventDate = new Date(event.startTime);
      return (
        eventDate.getDate() === day.date &&
        eventDate.getMonth() === day.fullDate.getMonth() &&
        eventDate.getFullYear() === day.fullDate.getFullYear()
      );
    });
    return { day, events: dayEvents };
  });

  const handleDrop = async (day: Date, event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedTask) return;

    try {
      const startTime = new Date(day);
      startTime.setHours(9, 0, 0, 0);
      const endTime = new Date(startTime);
      endTime.setHours(10, 0, 0, 0);

      await createEvent({
        title: draggedTask.title,
        description: draggedTask.description,
        startDate: startTime.getTime(),
        endDate: endTime.getTime(),
        allDay: false,
        taskId: draggedTask.taskId as Id<"tasks">,
      });
    } catch (error) {
      console.error("Failed to create event:", error);
    }

    setDraggedTask(null);
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case "connected":
        return "Google Calendar Connected";
      case "connecting":
        return "Connecting...";
      case "error":
        return "Connection Error";
      default:
        return "Not Connected";
    }
  };

  const themeClasses = {
    sidebar: isDarkMode
      ? "bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/60 shadow-2xl shadow-black/30"
      : "bg-white/80 backdrop-blur-xl border-r border-purple-200/30 shadow-2xl shadow-purple-900/10",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-300" : "text-gray-700",
      tertiary: isDarkMode ? "text-gray-400" : "text-gray-600",
    },
    timeSlot: isDarkMode
      ? "border-gray-700/50 text-gray-400 bg-gray-900/20"
      : "border-gray-200/50 text-gray-600 bg-gray-50/30",
    dayHeader: isDarkMode
      ? "bg-gray-800/50 border-gray-700/50"
      : "bg-gray-50/80 border-gray-200/50",
    calendarGrid: isDarkMode ? "bg-gray-900/10" : "bg-white/20",
    search: isDarkMode
      ? "bg-gray-800/70 border-gray-700/60 text-gray-100 placeholder-gray-400 focus:border-purple-500/50 focus:bg-gray-800/90"
      : "bg-white/80 border-purple-200/60 text-gray-800 placeholder-gray-500 focus:border-purple-400/50 focus:bg-white/95",
    button: isDarkMode
      ? "bg-gray-700/60 text-gray-300 hover:bg-gray-700/80"
      : "bg-gray-100/80 text-gray-700 hover:bg-gray-100/95",
    connectionButton: isDarkMode
      ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
      : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300",
  };

  const getTaskColor = (color: string, isDark: boolean) => {
    const colors = {
      purple: isDark
        ? "bg-gradient-to-br from-purple-500/20 to-purple-600/15 text-purple-300 border-purple-400/40 shadow-lg shadow-purple-900/30"
        : "bg-gradient-to-br from-purple-50/95 to-purple-100/80 text-purple-800 border-purple-200/70 shadow-lg shadow-purple-200/40",
      blue: isDark
        ? "bg-gradient-to-br from-blue-500/20 to-blue-600/15 text-blue-300 border-blue-400/40 shadow-lg shadow-blue-900/30"
        : "bg-gradient-to-br from-blue-50/95 to-blue-100/80 text-blue-800 border-blue-200/70 shadow-lg shadow-blue-200/40",
      green: isDark
        ? "bg-gradient-to-br from-green-500/20 to-green-600/15 text-green-300 border-green-400/40 shadow-lg shadow-green-900/30"
        : "bg-gradient-to-br from-green-50/95 to-green-100/80 text-green-800 border-green-200/70 shadow-lg shadow-green-200/40",
      orange: isDark
        ? "bg-gradient-to-br from-orange-500/20 to-orange-600/15 text-orange-300 border-orange-400/40 shadow-lg shadow-orange-900/30"
        : "bg-gradient-to-br from-orange-50/95 to-orange-100/80 text-orange-800 border-orange-200/70 shadow-lg shadow-orange-200/40",
      pink: isDark
        ? "bg-gradient-to-br from-pink-500/20 to-pink-600/15 text-pink-300 border-pink-400/40 shadow-lg shadow-pink-900/30"
        : "bg-gradient-to-br from-pink-50/95 to-pink-100/80 text-pink-800 border-pink-200/70 shadow-lg shadow-pink-200/40",
      indigo: isDark
        ? "bg-gradient-to-br from-indigo-500/20 to-indigo-600/15 text-indigo-300 border-indigo-400/40 shadow-lg shadow-indigo-900/30"
        : "bg-gradient-to-br from-indigo-50/95 to-indigo-100/80 text-indigo-800 border-indigo-200/70 shadow-lg shadow-indigo-200/40",
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getPriorityColor = (priority: string, isDark: boolean) => {
    switch (priority) {
      case "urgent":
        return isDark
          ? "bg-red-500/25 text-red-300 border-red-400/50 shadow-sm shadow-red-900/20"
          : "bg-red-100/80 text-red-700 border-red-300/70 shadow-sm shadow-red-200/30";
      case "high":
        return isDark
          ? "bg-orange-500/25 text-orange-300 border-orange-400/50 shadow-sm shadow-orange-900/20"
          : "bg-orange-100/80 text-orange-700 border-orange-300/70 shadow-sm shadow-orange-200/30";
      case "normal":
        return isDark
          ? "bg-blue-500/25 text-blue-300 border-blue-400/50 shadow-sm shadow-blue-900/20"
          : "bg-blue-100/80 text-blue-700 border-blue-300/70 shadow-sm shadow-blue-200/30";
      case "low":
        return isDark
          ? "bg-green-500/25 text-green-300 border-green-400/50 shadow-sm shadow-green-900/20"
          : "bg-green-100/80 text-green-700 border-green-300/70 shadow-sm shadow-green-200/30";
      default:
        return isDark
          ? "bg-gray-500/25 text-gray-300 border-gray-400/50 shadow-sm shadow-gray-900/20"
          : "bg-gray-100/80 text-gray-700 border-gray-300/70 shadow-sm shadow-gray-200/30";
    }
  };

  // Helper functions for calendar layout
  const getTimePosition = (time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    return (hour * 60 + minute) * (120 / 60);
  };

  const getCurrentTimeIndicatorStyle = () => {
    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const timePosition = getTimePosition(
      `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`,
    );

    return {
      top: `${timePosition}px`,
      zIndex: 50,
    };
  };

  const shouldShowCurrentTimeIndicator = () => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const adjustedDay = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
    return adjustedDay >= 0 && adjustedDay <= 6;
  };

  const scrollToCurrentTime = () => {
    if (calendarScrollRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const timePosition = getTimePosition(
        `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`,
      );
      const scrollContainer = calendarScrollRef.current;
      const containerHeight = scrollContainer.clientHeight;
      const scrollTo = Math.max(0, timePosition - containerHeight / 2);

      scrollContainer.scrollTo({
        top: scrollTo,
        behavior: "smooth",
      });
    }
  };

  // Task Card Component
  const TaskCard = ({
    task,
    draggable = true,
  }: {
    task: {
      _id: string;
      title: string;
      description?: string;
      priority?: string;
      projectName?: string;
      projectColor?: string;
    };
    draggable?: boolean;
  }) => {
    const color = task.projectColor ? "blue" : "blue"; // Simplified for now

    return (
      <div
        className={`p-2.5 rounded-lg border backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group ${getTaskColor(color, isDarkMode)} ${
          draggable ? "cursor-grab hover:cursor-grabbing transform-gpu" : ""
        }`}
        draggable={draggable}
        onDragStart={() => {
          if (draggable) {
            setDraggedTask({
              id: task._id,
              title: task.title,
              description: task.description,
              taskId: task._id as Id<"tasks">,
            });
          }
        }}
      >
        <div className="flex items-start space-x-2 mb-2">
          {draggable && (
            <GripVertical className="w-3 h-3 mt-0.5 opacity-40 group-hover:opacity-70 transition-opacity flex-shrink-0" />
          )}
          <CheckSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 opacity-80" />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-semibold leading-tight truncate">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs opacity-60 leading-tight mt-0.5 line-clamp-1">
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium backdrop-blur-sm border ${getPriorityColor(task.priority || "normal", isDarkMode)}`}
          >
            {task.priority || "normal"}
          </span>
          {task.projectName && (
            <span className="text-xs opacity-60 truncate max-w-[100px]">
              {task.projectName}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-full overflow-hidden ${className}`}>
      {/* Tasks Sidebar */}
      <div className={`w-80 ${themeClasses.sidebar} flex flex-col`}>
        <div className="p-4 border-b border-gray-200/20">
          <h2 className={`text-base font-bold ${themeClasses.text.primary}`}>
            Unscheduled Tasks
          </h2>
          <p className={`text-xs ${themeClasses.text.tertiary} mt-1`}>
            Drag tasks to calendar to schedule
          </p>
        </div>

        {/* Search Bar and New Task Button */}
        <div className="p-3 border-b border-gray-200/20">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search
                className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 z-10 ${themeClasses.text.tertiary}`}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-lg border backdrop-blur-md transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 ${themeClasses.search}`}
              />
            </div>
            <button className="flex items-center justify-center px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md shadow-purple-500/30 hover:shadow-lg hover:shadow-purple-500/40 transform hover:-translate-y-0.5 font-medium backdrop-blur-sm">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {unscheduledTasks
              ?.filter(
                (task) =>
                  task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (task.description
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ??
                    false),
              )
              .map((task) => (
                <TaskCard key={task._id} task={task} draggable={true} />
              ))}
          </div>

          {(!unscheduledTasks || unscheduledTasks.length === 0) && (
            <div className={`text-center py-8 ${themeClasses.text.tertiary}`}>
              <Clock className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No tasks found</p>
              <p className="text-xs opacity-70 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Calendar Area */}
      <main className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          {/* Calendar Header with Controls */}
          <div
            className={`p-3 border-b ${isDarkMode ? "border-gray-700/40 bg-gray-900/30" : "border-gray-200/40 bg-white/30"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <h1
                  className={`text-lg font-bold ${themeClasses.text.primary}`}
                >
                  {currentWeekDisplay}
                </h1>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() =>
                      setCurrentWeek(
                        new Date(
                          currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000,
                        ),
                      )
                    }
                    className={`p-1.5 rounded-lg transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/60"}`}
                  >
                    <ChevronLeft
                      className={`w-4 h-4 ${themeClasses.text.secondary}`}
                    />
                  </button>
                  <button
                    onClick={() =>
                      setCurrentWeek(
                        new Date(
                          currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000,
                        ),
                      )
                    }
                    className={`p-1.5 rounded-lg transition-all duration-200 ${isDarkMode ? "hover:bg-gray-700/50" : "hover:bg-gray-100/60"}`}
                  >
                    <ChevronRight
                      className={`w-4 h-4 ${themeClasses.text.secondary}`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Google Calendar Connection Status */}
                <div className="flex items-center space-x-2">
                  {!isGoogleCalendarConnected ? (
                    <button
                      onClick={handleConnectGoogle}
                      disabled={
                        isLoadingGoogle || connectionStatus === "connecting"
                      }
                      className={`px-3 py-1.5 rounded-lg border transition-all duration-200 text-xs font-medium disabled:opacity-50 ${themeClasses.connectionButton}`}
                    >
                      {isLoadingGoogle || connectionStatus === "connecting" ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Connecting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-3 h-3" />
                          <span>Connect Google Calendar</span>
                        </div>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div
                        className={`flex items-center space-x-2 px-2 py-1 rounded-lg text-xs font-medium ${
                          connectionStatus === "connected"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : connectionStatus === "error"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        }`}
                      >
                        {connectionStatus === "connected" ? (
                          <Wifi className="w-3 h-3" />
                        ) : connectionStatus === "error" ? (
                          <WifiOff className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>{getConnectionStatusText()}</span>
                        {isLoadingGoogle && (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        )}
                      </div>
                      <button
                        onClick={handleDisconnectGoogle}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={scrollToCurrentTime}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-200 text-xs font-medium ${themeClasses.button}`}
                >
                  Today
                </button>
              </div>
            </div>

            {/* Error Message */}
            {googleCalendarError && (
              <div className="mt-3 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-red-800 dark:text-red-200 font-medium">
                      {googleCalendarError}
                    </p>
                    <button
                      onClick={() => setGoogleCalendarError(null)}
                      className="text-xs text-red-600 dark:text-red-400 underline hover:no-underline mt-1"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Calendar Grid */}
          <div
            className={`flex-1 overflow-hidden ${themeClasses.calendarGrid}`}
          >
            <div
              className="flex-1 overflow-auto max-h-full"
              ref={calendarScrollRef}
            >
              <div className="relative" style={{ height: `${24 * 120}px` }}>
                {/* Day Headers */}
                <div
                  className="grid grid-cols-8 border-b border-dashed sticky top-0 z-30"
                  style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}
                >
                  <div
                    className={`p-2 border-r border-dashed ${themeClasses.dayHeader} ${isDarkMode ? "border-gray-700/60" : "border-gray-300/60"}`}
                  ></div>
                  {weekDays.map((day) => (
                    <div
                      key={day.name}
                      className={`p-2 text-center border-r border-dashed ${themeClasses.dayHeader} ${isDarkMode ? "border-gray-700/60" : "border-gray-300/60"}`}
                    >
                      <div
                        className={`text-xs font-medium ${themeClasses.text.secondary} uppercase tracking-wide`}
                      >
                        {day.short}
                      </div>
                      <div
                        className={`text-lg font-bold ${themeClasses.text.primary} mt-0.5`}
                      >
                        {day.date}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Current Time Indicator */}
                {shouldShowCurrentTimeIndicator() && (
                  <div
                    className="absolute left-0 right-0 pointer-events-none z-40"
                    style={getCurrentTimeIndicatorStyle()}
                  >
                    <div className="flex items-center">
                      <div className="px-2 py-1 rounded text-xs font-bold shadow-lg z-50 bg-red-500 text-white">
                        {currentTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </div>
                      <div className="flex-1 h-0.5 bg-red-500 shadow-lg"></div>
                      <div className="w-2 h-2 bg-red-500 rounded-full shadow-lg mr-2"></div>
                    </div>
                  </div>
                )}

                {/* Time Grid */}
                <div className="relative">
                  {timeSlots.map((time, index) => (
                    <div
                      key={time}
                      className={`grid grid-cols-8 border-b border-dashed transition-colors duration-200 ${
                        isDarkMode
                          ? "border-gray-700/50 hover:bg-gray-800/10"
                          : "border-gray-300/50 hover:bg-gray-50/20"
                      }`}
                      style={{
                        gridTemplateColumns: "80px repeat(7, 1fr)",
                        height: "120px",
                      }}
                    >
                      <div
                        className={`p-2 border-r border-dashed text-center ${themeClasses.timeSlot} ${isDarkMode ? "border-gray-700/60" : "border-gray-300/60"}`}
                      >
                        <span className="text-xs font-medium">{time}</span>
                      </div>
                      {weekDays.map((day, dayIndex) => (
                        <div
                          key={`${time}-${day.name}`}
                          className={`relative border-r border-dashed transition-all duration-200 group ${
                            isDarkMode
                              ? "border-gray-700/60 hover:bg-gray-800/5"
                              : "border-gray-300/60 hover:bg-gray-50/10"
                          }`}
                          onDrop={(e) => handleDrop(day.fullDate, e)}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <div
                            className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded m-0.5 border border-dashed ${isDarkMode ? "border-purple-500/40" : "border-purple-400/50"}`}
                          ></div>

                          {/* Events for this day and time slot */}
                          {index === 0 &&
                            eventsByDay[dayIndex]?.events.map((event) => {
                              const eventStartHour = event.startTime.getHours();
                              const eventStartMinute =
                                event.startTime.getMinutes();
                              const eventEndHour = event.endTime.getHours();
                              const eventEndMinute = event.endTime.getMinutes();

                              const startPosition = getTimePosition(
                                `${eventStartHour.toString().padStart(2, "0")}:${eventStartMinute.toString().padStart(2, "0")}`,
                              );
                              const endPosition = getTimePosition(
                                `${eventEndHour.toString().padStart(2, "0")}:${eventEndMinute.toString().padStart(2, "0")}`,
                              );
                              const height = Math.max(
                                endPosition - startPosition,
                                30,
                              );

                              return (
                                <div
                                  key={event.id}
                                  className={`absolute rounded-lg cursor-pointer backdrop-blur-md border transition-all duration-200 hover:shadow-lg group flex flex-col overflow-hidden ${
                                    event.type === "app"
                                      ? getTaskColor("blue", isDarkMode)
                                      : getTaskColor("green", isDarkMode)
                                  }`}
                                  style={{
                                    top: `${startPosition}px`,
                                    height: `${height}px`,
                                    left: "4px",
                                    right: "4px",
                                    zIndex: 10,
                                    maxWidth: "calc(100% - 8px)",
                                  }}
                                >
                                  <div className="p-2 flex flex-col h-full overflow-hidden">
                                    <div className="flex items-start justify-between mb-1 flex-shrink-0">
                                      <h4 className="font-semibold text-xs leading-tight truncate flex-1 pr-1">
                                        {event.title}
                                      </h4>
                                      {event.type === "google" &&
                                        event.htmlLink && (
                                          <a
                                            href={event.htmlLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-shrink-0 ml-1 opacity-60 hover:opacity-100"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <ExternalLink className="w-3 h-3" />
                                          </a>
                                        )}
                                    </div>
                                    <div className="flex items-center space-x-1 mb-1 flex-shrink-0">
                                      <Clock className="w-3 h-3 opacity-75" />
                                      <span className="text-xs font-medium truncate opacity-75">
                                        {event.startTime.toLocaleTimeString(
                                          "en-US",
                                          {
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                          },
                                        )}{" "}
                                        -{" "}
                                        {event.endTime.toLocaleTimeString(
                                          "en-US",
                                          {
                                            hour: "numeric",
                                            minute: "2-digit",
                                            hour12: true,
                                          },
                                        )}
                                      </span>
                                    </div>
                                    {event.description && height > 60 && (
                                      <p className="text-xs opacity-60 leading-tight flex-1 overflow-hidden">
                                        {event.description}
                                      </p>
                                    )}
                                    <div className="flex items-center justify-between mt-auto flex-shrink-0">
                                      <span className="text-xs opacity-60 truncate">
                                        {event.type === "app"
                                          ? "App Event"
                                          : "Google Calendar"}
                                      </span>
                                      {event.projectName && (
                                        <span className="text-xs opacity-60 truncate max-w-[60px]">
                                          {event.projectName}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
