import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, Plus } from 'lucide-react'
import IngredientSearch from './components/IngredientSearch'
import IngredientStats from './components/IngredientStats'
import AddIngredientForm from './components/AddIngredientForm'

export const runtime = 'edge'

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
        <IngredientStats />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Search & Results - Takes up 2/3 */}
        <div className="lg:col-span-2 space-y-6">
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