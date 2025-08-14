"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useEvents } from "@/lib/hooks/use-events"
import { formatDateTime } from "@/lib/utils/format"
import { Calendar, Clock, Users, BookOpen, ExternalLink } from "lucide-react"

export function UpcomingEvents() {
  const { events, loading } = useEvents()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg sm:text-xl">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "live_session":
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
      case "webinar":
        return <Users className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
      case "workshop":
        return <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
      default:
        return <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
    }
  }

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "live_session":
        return "bg-green-100"
      case "webinar":
        return "bg-blue-100"
      case "workshop":
        return "bg-purple-100"
      default:
        return "bg-gray-100"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-lg sm:text-xl">
          <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-4">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No upcoming events</p>
          </div>
        ) : (
          events.slice(0, 5).map((event) => (
            <div key={event.id} className="flex items-start space-x-3 group">
              <div className={`p-1 rounded flex-shrink-0 ${getEventColor(event.event_type)}`}>
                {getEventIcon(event.event_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs sm:text-sm truncate">{event.title}</p>
                    <p className="text-xs text-gray-600">{formatDateTime(event.start_time)}</p>
                    {event.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{event.description}</p>
                    )}
                  </div>
                  {event.meeting_url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      onClick={() => window.open(event.meeting_url, "_blank")}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
