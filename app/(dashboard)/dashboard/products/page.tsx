import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Search } from 'lucide-react'
import ProductSearch from './components/ProductSearch'

// export const runtime removed for static deployment

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Package className="h-8 w-8 text-primary" />
            Products Management
          </h1>
          <p className="text-muted-foreground">
            Search, edit, and manage product information and classifications
          </p>
        </div>
      </div>

      {/* Statistics */}
      <Suspense fallback={<div className="h-48 bg-gray-100 animate-pulse rounded-lg" />}>
        
      </Suspense>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Products
          </CardTitle>
          <CardDescription>
            Find products by name, brand, or UPC barcode to view and edit their information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductSearch />
        </CardContent>
      </Card>
    </div>
  )
}