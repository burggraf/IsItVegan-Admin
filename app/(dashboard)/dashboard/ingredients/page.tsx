import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Leaf, Plus, AlertTriangle, Clock } from 'lucide-react'
import IngredientSearch from './components/IngredientSearch'
import UnclassifiedIngredients from './components/UnclassifiedIngredients'
import NewestIngredients from './components/NewestIngredients'
import AddIngredientForm from './components/AddIngredientForm'

// export const runtime removed for static deployment

export default function IngredientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            Ingredients Management
          </h1>
          <p className="text-muted-foreground">
            Search, edit, and manage ingredient classifications
          </p>
        </div>
      </div>

      {/* Statistics */}
      <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-lg" />}>
        
      </Suspense>

      {/* Main Content with Tabs */}
      <div className="w-full">
        <Tabs defaultValue="search" className="w-full">
          <TabsList>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="unclassified" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Unclassified
            </TabsTrigger>
            <TabsTrigger value="newest" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              New
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Search Ingredients
                </CardTitle>
                <CardDescription>
                  Find ingredients by title to view and edit their classifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IngredientSearch />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="unclassified">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Unclassified Ingredients
                </CardTitle>
                <CardDescription>
                  Ingredients without classification, ordered by product count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UnclassifiedIngredients />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newest">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Newest Ingredients
                </CardTitle>
                <CardDescription>
                  All ingredients ordered by creation date, newest first
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewestIngredients />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Ingredient
                </CardTitle>
                <CardDescription>
                  Create a new ingredient entry
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddIngredientForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}