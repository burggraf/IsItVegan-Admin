import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Leaf, Plus, AlertTriangle } from 'lucide-react'
import IngredientSearch from './components/IngredientSearch'
import UnclassifiedIngredients from './components/UnclassifiedIngredients'
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tabbed Content - Takes up 2/3 */}
        <div className="lg:col-span-2 space-y-6">
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
          </Tabs>
        </div>

        {/* Add New Ingredient - Takes up 1/3 */}
        <div className="space-y-6">
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
        </div>
      </div>
    </div>
  )
}