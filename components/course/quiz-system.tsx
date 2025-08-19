"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  Trophy,
  Clock,
  Target,
  BookOpen
} from "lucide-react"

interface Question {
  id: string
  type: 'multiple-choice' | 'multiple-select' | 'true-false' | 'short-answer'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  explanation?: string
  points: number
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  timeLimit?: number // in minutes
  passingScore: number // percentage
}

interface QuizSystemProps {
  quiz: Quiz
  onComplete: (score: number, passed: boolean) => void
  onClose: () => void
}

export function QuizSystem({ quiz, onComplete, onClose }: QuizSystemProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [passed, setPassed] = useState(false)

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100

  // Timer effect
  useEffect(() => {
    if (!timeRemaining || timeRemaining <= 0) return

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev && prev <= 1) {
          handleSubmit()
          return 0
        }
        return prev ? prev - 1 : null
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    setIsSubmitted(true)
    
    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0

    quiz.questions.forEach(question => {
      totalPoints += question.points
      const userAnswer = answers[question.id]
      
      if (userAnswer) {
        if (Array.isArray(question.correctAnswer)) {
          // Multiple select
          if (Array.isArray(userAnswer) && 
              userAnswer.length === question.correctAnswer.length &&
              userAnswer.every(ans => question.correctAnswer.includes(ans))) {
            earnedPoints += question.points
          }
        } else {
          // Single answer
          if (userAnswer === question.correctAnswer) {
            earnedPoints += question.points
          }
        }
      }
    })

    const finalScore = Math.round((earnedPoints / totalPoints) * 100)
    const quizPassed = finalScore >= quiz.passingScore

    setScore(finalScore)
    setPassed(quizPassed)
    setShowResults(true)
    onComplete(finalScore, quizPassed)
  }

  const renderQuestion = () => {
    const userAnswer = answers[currentQuestion.id]

    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <RadioGroup
            value={userAnswer as string || ''}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case 'multiple-select':
        return (
          <div className="space-y-2">
            {currentQuestion.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`option-${index}`}
                  checked={(userAnswer as string[] || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = userAnswer as string[] || []
                    if (checked) {
                      handleAnswerChange(currentQuestion.id, [...currentAnswers, option])
                    } else {
                      handleAnswerChange(currentQuestion.id, currentAnswers.filter(ans => ans !== option))
                    }
                  }}
                />
                <Label htmlFor={`option-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        )

      case 'true-false':
        return (
          <RadioGroup
            value={userAnswer as string || ''}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="true" />
              <Label htmlFor="true" className="text-sm">True</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="false" />
              <Label htmlFor="false" className="text-sm">False</Label>
            </div>
          </RadioGroup>
        )

      case 'short-answer':
        return (
          <Textarea
            placeholder="Enter your answer..."
            value={userAnswer as string || ''}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            className="min-h-[100px]"
          />
        )

      default:
        return null
    }
  }

  const renderResults = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mb-4">
            {passed ? (
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-2" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-2" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold mb-2">
            {passed ? 'Congratulations!' : 'Keep Learning!'}
          </h2>
          
          <p className="text-gray-600 mb-4">
            {passed 
              ? 'You have successfully completed this quiz.'
              : `You need ${quiz.passingScore}% to pass. Keep studying and try again!`
            }
          </p>

          <div className="flex items-center justify-center gap-4 mb-6">
            <Badge variant={passed ? "default" : "secondary"} className="text-lg px-4 py-2">
              <Target className="h-4 w-4 mr-2" />
              Score: {score}%
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Trophy className="h-4 w-4 mr-2" />
              Passing: {quiz.passingScore}%
            </Badge>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Question Review</h3>
          {quiz.questions.map((question, index) => {
            const userAnswer = answers[question.id]
            const isCorrect = Array.isArray(question.correctAnswer)
              ? Array.isArray(userAnswer) && 
                userAnswer.length === question.correctAnswer.length &&
                userAnswer.every(ans => question.correctAnswer.includes(ans))
              : userAnswer === question.correctAnswer

            return (
              <Card key={question.id} className={`border-l-4 ${
                isCorrect ? 'border-l-green-500' : 'border-l-red-500'
              }`}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">Question {index + 1}</p>
                      <p className="text-sm text-gray-600">{question.question}</p>
                    </div>
                  </div>
                  
                  <div className="ml-7 space-y-1">
                    <p className="text-xs text-gray-500">
                      <strong>Your answer:</strong> {Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer || 'No answer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      <strong>Correct answer:</strong> {Array.isArray(question.correctAnswer) ? question.correctAnswer.join(', ') : question.correctAnswer}
                    </p>
                    {question.explanation && (
                      <p className="text-xs text-blue-600 mt-1">
                        <strong>Explanation:</strong> {question.explanation}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={onClose} variant="outline">
            Close Quiz
          </Button>
          {!passed && (
            <Button onClick={() => {
              setCurrentQuestionIndex(0)
              setAnswers({})
              setIsSubmitted(false)
              setShowResults(false)
              setTimeRemaining(quiz.timeLimit ? quiz.timeLimit * 60 : null)
            }}>
              Retake Quiz
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {quiz.title} - Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderResults()}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {quiz.title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{quiz.description}</p>
          </div>
          {timeRemaining && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTime(timeRemaining)}
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          {renderQuestion()}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isSubmitted}>
                Submit Quiz
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
