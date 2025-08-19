"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  BookOpen,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Users,
  Play,
  Clock,
  Star,
  Tag,
  Video,
  Image,
  FileText,
  Settings,
  Save,
  X,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  difficulty_level: string
  estimated_duration?: number
  required_plan: string
  sort_order: number
  is_published: boolean
  created_at: string
  category?: {
    id: string
    name: string
    icon?: string
  }
  modules?: Array<{
    id: string
    title: string
    content_type: string
    duration?: number
    is_published: boolean
  }>
  enrollmentCount?: number
  avgProgress?: string
}

interface CourseCategory {
  id: string
  name: string
  description?: string
  icon?: string
  sort_order: number
  is_active: boolean
}

interface CourseModule {
  id: string
  course_id: string
  title: string
  description?: string
  content_type: string
  content_url?: string
  duration?: number
  sort_order: number
  is_published: boolean
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<CourseCategory[]>([])
  const [modules, setModules] = useState<CourseModule[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false)
  const [isEditModuleDialogOpen, setIsEditModuleDialogOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CourseCategory | null>(null)
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null)
  
  // Form states
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    thumbnail_url: "",
    difficulty_level: "beginner",
    estimated_duration: 0,
    required_plan: "basic",
    sort_order: 0,
    category_id: "none",
    is_published: false
  })

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    icon: "",
    sort_order: 0,
    is_active: true
  })

  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    content_type: "video",
    content_url: "",
    duration: 0,
    sort_order: 0,
    is_published: false
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchCourses()
    fetchCategories()
  }, [page, search, categoryFilter, statusFilter])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(categoryFilter !== 'all' && { categoryId: categoryFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      })

      const response = await fetch(`/api/admin/courses?${params}`)
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
        setPagination(data.pagination)
      } else {
        setError('Failed to fetch courses')
      }
    } catch (error) {
      setError('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/course-categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchModules = async (courseId: string) => {
    try {
      const response = await fetch(`/api/admin/course-modules?courseId=${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setModules(data.modules)
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error)
    }
  }

  const handleCreateCourse = async () => {
    try {
      const response = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseForm)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: data.message,
        })
        setIsCreateDialogOpen(false)
        setCourseForm({
          title: "",
          description: "",
          thumbnail_url: "",
          difficulty_level: "beginner",
          estimated_duration: 0,
          required_plan: "basic",
          sort_order: 0,
          category_id: "none",
          is_published: false
        })
        fetchCourses()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCourse = async () => {
    if (!selectedCourse) return

    try {
      const response = await fetch('/api/admin/courses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedCourse.id, ...courseForm })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success! ✨",
          description: data.message,
        })
        setIsEditDialogOpen(false)
        setSelectedCourse(null)
        fetchCourses()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return

    try {
      const response = await fetch(`/api/admin/courses?id=${courseId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success! 🗑️",
          description: data.message,
        })
        fetchCourses()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      })
    }
  }

  const handleCreateCategory = async () => {
    try {
      const response = await fetch('/api/admin/course-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryForm)
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: data.message,
        })
        setIsCategoryDialogOpen(false)
        setCategoryForm({
          name: "",
          description: "",
          icon: "",
          sort_order: 0,
          is_active: true
        })
        fetchCategories()
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      })
    }
  }

  const handleCreateModule = async () => {
    if (!selectedCourse) return

    try {
      const response = await fetch('/api/admin/course-modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: selectedCourse.id, ...moduleForm })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success! 🎉",
          description: data.message,
        })
        setIsModuleDialogOpen(false)
        setModuleForm({
          title: "",
          description: "",
          content_type: "video",
          content_url: "",
          duration: 0,
          sort_order: 0,
          is_published: false
        })
        fetchModules(selectedCourse.id)
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive",
      })
    }
  }

  const handleUpdateModule = async () => {
    if (!selectedModule) return

    try {
      const response = await fetch('/api/admin/course-modules', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedModule.id, ...moduleForm })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success! ✨",
          description: data.message,
        })
        setIsEditModuleDialogOpen(false)
        setSelectedModule(null)
        setModuleForm({
          title: "",
          description: "",
          content_type: "video",
          content_url: "",
          duration: 0,
          sort_order: 0,
          is_published: false
        })
        if (selectedCourse) {
          fetchModules(selectedCourse.id)
        }
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update module",
        variant: "destructive",
      })
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module?')) return

    try {
      const response = await fetch(`/api/admin/course-modules?id=${moduleId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success! 🗑️",
          description: data.message,
        })
        if (selectedCourse) {
          fetchModules(selectedCourse.id)
        }
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive",
      })
    }
  }

  const openEditModuleDialog = (module: CourseModule) => {
    setSelectedModule(module)
    setModuleForm({
      title: module.title,
      description: module.description || "",
      content_type: module.content_type,
      content_url: module.content_url || "",
      duration: module.duration || 0,
      sort_order: module.sort_order,
      is_published: module.is_published
    })
    setIsEditModuleDialogOpen(true)
  }

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course)
    setCourseForm({
      title: course.title,
      description: course.description,
      thumbnail_url: course.thumbnail_url || "",
      difficulty_level: course.difficulty_level,
      estimated_duration: course.estimated_duration || 0,
      required_plan: course.required_plan,
      sort_order: course.sort_order,
      category_id: course.category?.id || "none",
      is_published: course.is_published
    })
    setIsEditDialogOpen(true)
  }

  const openModuleDialog = (course: Course) => {
    setSelectedCourse(course)
    fetchModules(course.id)
    setIsModuleDialogOpen(true)
  }

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic': return 'bg-blue-100 text-blue-800'
      case 'premium': return 'bg-purple-100 text-purple-800'
      case 'pro': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">


      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Management</CardTitle>
              <p className="text-muted-foreground">
                Manage your courses, categories, and modules
              </p>
            </div>
            <div className="flex gap-2">
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Tag className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Course Category</DialogTitle>
                    <DialogDescription>
                      Add a new category to organize your courses
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        placeholder="e.g., Technical Analysis"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryDescription">Description</Label>
                      <Textarea
                        id="categoryDescription"
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        placeholder="Brief description of this category"
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryIcon">Icon (Lucide icon name)</Label>
                      <Input
                        id="categoryIcon"
                        value={categoryForm.icon}
                        onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                        placeholder="e.g., TrendingUp"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCategory}>
                      <Save className="h-4 w-4 mr-2" />
                      Create Category
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>
                      Add a new course to your academy
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="courseTitle">Course Title</Label>
                        <Input
                          id="courseTitle"
                          value={courseForm.title}
                          onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                          placeholder="e.g., Technical Analysis Fundamentals"
                        />
                      </div>
                      <div>
                        <Label htmlFor="courseCategory">Category</Label>
                        <Select value={courseForm.category_id} onValueChange={(value) => setCourseForm({ ...courseForm, category_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="courseDescription">Description</Label>
                      <Textarea
                        id="courseDescription"
                        value={courseForm.description}
                        onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                        placeholder="Course description..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="courseThumbnail">Thumbnail URL</Label>
                        <Input
                          id="courseThumbnail"
                          value={courseForm.thumbnail_url}
                          onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                          placeholder="https://example.com/thumbnail.jpg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="courseDuration">Duration (minutes)</Label>
                        <Input
                          id="courseDuration"
                          type="number"
                          value={courseForm.estimated_duration}
                          onChange={(e) => setCourseForm({ ...courseForm, estimated_duration: parseInt(e.target.value) || 0 })}
                          placeholder="120"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="courseDifficulty">Difficulty</Label>
                        <Select value={courseForm.difficulty_level} onValueChange={(value) => setCourseForm({ ...courseForm, difficulty_level: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="coursePlan">Required Plan</Label>
                        <Select value={courseForm.required_plan} onValueChange={(value) => setCourseForm({ ...courseForm, required_plan: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Basic</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="courseOrder">Sort Order</Label>
                        <Input
                          id="courseOrder"
                          type="number"
                          value={courseForm.sort_order}
                          onChange={(e) => setCourseForm({ ...courseForm, sort_order: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="coursePublished"
                        checked={courseForm.is_published}
                        onCheckedChange={(checked) => setCourseForm({ ...courseForm, is_published: checked })}
                      />
                      <Label htmlFor="coursePublished">Published</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateCourse}>
                      <Save className="h-4 w-4 mr-2" />
                      Create Course
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {course.thumbnail_url && (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                      )}
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {course.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.category ? (
                      <Badge variant="outline">
                        {course.category.icon && <span className="mr-1">{course.category.icon}</span>}
                        {course.category.name}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">No category</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getDifficultyColor(course.difficulty_level)}>
                      {course.difficulty_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlanColor(course.required_plan)}>
                      {course.required_plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {course.estimated_duration ? (
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.estimated_duration} min
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      {course.enrollmentCount || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={course.is_published ? "default" : "secondary"}>
                      {course.is_published ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openModuleDialog(course)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(course)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update course information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCourseTitle">Course Title</Label>
                <Input
                  id="editCourseTitle"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editCourseCategory">Category</Label>
                <Select value={courseForm.category_id} onValueChange={(value) => setCourseForm({ ...courseForm, category_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editCourseDescription">Description</Label>
              <Textarea
                id="editCourseDescription"
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCourseThumbnail">Thumbnail URL</Label>
                <Input
                  id="editCourseThumbnail"
                  value={courseForm.thumbnail_url}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail_url: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="editCourseDuration">Duration (minutes)</Label>
                <Input
                  id="editCourseDuration"
                  type="number"
                  value={courseForm.estimated_duration}
                  onChange={(e) => setCourseForm({ ...courseForm, estimated_duration: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="editCourseDifficulty">Difficulty</Label>
                <Select value={courseForm.difficulty_level} onValueChange={(value) => setCourseForm({ ...courseForm, difficulty_level: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editCoursePlan">Required Plan</Label>
                <Select value={courseForm.required_plan} onValueChange={(value) => setCourseForm({ ...courseForm, required_plan: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editCourseOrder">Sort Order</Label>
                <Input
                  id="editCourseOrder"
                  type="number"
                  value={courseForm.sort_order}
                  onChange={(e) => setCourseForm({ ...courseForm, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="editCoursePublished"
                checked={courseForm.is_published}
                onCheckedChange={(checked) => setCourseForm({ ...courseForm, is_published: checked })}
              />
              <Label htmlFor="editCoursePublished">Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCourse}>
              <Save className="h-4 w-4 mr-2" />
              Update Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modules Dialog */}
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Course Modules - {selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              Manage modules and content for this course
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="modules" className="w-full">
            <TabsList>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="add-module">Add Module</TabsTrigger>
            </TabsList>
            
            <TabsContent value="modules" className="space-y-4">
              <div className="space-y-2">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {module.content_type === 'video' && <Video className="h-4 w-4 text-blue-500" />}
                        {module.content_type === 'document' && <FileText className="h-4 w-4 text-green-500" />}
                        {module.content_type === 'quiz' && <Star className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div>
                        <div className="font-medium">{module.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {module.description}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={module.is_published ? "default" : "secondary"}>
                        {module.is_published ? "Published" : "Draft"}
                      </Badge>
                      {module.duration && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {module.duration} min
                        </div>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditModuleDialog(module)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteModule(module.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {modules.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No modules yet. Add your first module!
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="add-module" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="moduleTitle">Module Title</Label>
                  <Input
                    id="moduleTitle"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    placeholder="e.g., Introduction to Technical Analysis"
                  />
                </div>
                <div>
                  <Label htmlFor="moduleType">Content Type</Label>
                  <Select value={moduleForm.content_type} onValueChange={(value) => setModuleForm({ ...moduleForm, content_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="moduleDescription">Description</Label>
                <Textarea
                  id="moduleDescription"
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Module description..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="moduleContentUrl">Content URL</Label>
                  <Input
                    id="moduleContentUrl"
                    value={moduleForm.content_url}
                    onChange={(e) => setModuleForm({ ...moduleForm, content_url: e.target.value })}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
                <div>
                  <Label htmlFor="moduleDuration">Duration (minutes)</Label>
                  <Input
                    id="moduleDuration"
                    type="number"
                    value={moduleForm.duration}
                    onChange={(e) => setModuleForm({ ...moduleForm, duration: parseInt(e.target.value) || 0 })}
                    placeholder="15"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="moduleOrder">Sort Order</Label>
                  <Input
                    id="moduleOrder"
                    type="number"
                    value={moduleForm.sort_order}
                    onChange={(e) => setModuleForm({ ...moduleForm, sort_order: parseInt(e.target.value) || 0 })}
                    placeholder="1"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="modulePublished"
                    checked={moduleForm.is_published}
                    onCheckedChange={(checked) => setModuleForm({ ...moduleForm, is_published: checked })}
                  />
                  <Label htmlFor="modulePublished">Published</Label>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsModuleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateModule}>
                  <Save className="h-4 w-4 mr-2" />
                  Add Module
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Module Dialog */}
      <Dialog open={isEditModuleDialogOpen} onOpenChange={setIsEditModuleDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Module</DialogTitle>
            <DialogDescription>
              Update module details and content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editModuleTitle">Module Title</Label>
                <Input
                  id="editModuleTitle"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g., Introduction to Technical Analysis"
                />
              </div>
              <div>
                <Label htmlFor="editModuleType">Content Type</Label>
                <Select value={moduleForm.content_type} onValueChange={(value) => setModuleForm({ ...moduleForm, content_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="editModuleDescription">Description</Label>
              <Textarea
                id="editModuleDescription"
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Module description..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editModuleContentUrl">Content URL</Label>
                <Input
                  id="editModuleContentUrl"
                  value={moduleForm.content_url}
                  onChange={(e) => setModuleForm({ ...moduleForm, content_url: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                />
              </div>
              <div>
                <Label htmlFor="editModuleDuration">Duration (minutes)</Label>
                <Input
                  id="editModuleDuration"
                  type="number"
                  value={moduleForm.duration}
                  onChange={(e) => setModuleForm({ ...moduleForm, duration: parseInt(e.target.value) || 0 })}
                  placeholder="15"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editModuleOrder">Sort Order</Label>
                <Input
                  id="editModuleOrder"
                  type="number"
                  value={moduleForm.sort_order}
                  onChange={(e) => setModuleForm({ ...moduleForm, sort_order: parseInt(e.target.value) || 0 })}
                  placeholder="1"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch
                  id="editModulePublished"
                  checked={moduleForm.is_published}
                  onCheckedChange={(checked) => setModuleForm({ ...moduleForm, is_published: checked })}
                />
                <Label htmlFor="editModulePublished">Published</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateModule}>
              <Save className="h-4 w-4 mr-2" />
              Update Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


