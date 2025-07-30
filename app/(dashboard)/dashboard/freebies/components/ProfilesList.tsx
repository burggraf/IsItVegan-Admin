'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Edit, Loader2 } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import EditProfileDialog from './EditProfileDialog'
import AddProfileDialog from './AddProfileDialog'

interface Profile {
  id: string
  email: string
  subscription_level: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

export default function ProfilesList() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  const fetchProfiles = async (query = '') => {
    try {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase.rpc('admin_search_profiles', {
        query: query,
        limit_count: 100
      })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfiles(debouncedSearchQuery)
  }, [debouncedSearchQuery])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const getSubscriptionBadge = (level: string) => {
    switch (level) {
      case 'standard':
        return <Badge variant="default" className="bg-primary">Standard</Badge>
      case 'free':
        return <Badge variant="secondary">Free</Badge>
      default:
        return <Badge variant="outline">{level}</Badge>
    }
  }

  const handleProfileUpdated = () => {
    fetchProfiles(debouncedSearchQuery)
    setEditingProfile(null)
  }

  const handleProfileAdded = () => {
    fetchProfiles(debouncedSearchQuery)
    setShowAddDialog(false)
  }

  return (
    <div className="space-y-4">
      {/* Search and Add Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>

      {/* Profiles Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading profiles...
                  </div>
                </TableCell>
              </TableRow>
            ) : profiles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No profiles found
                </TableCell>
              </TableRow>
            ) : (
              profiles.map((profile) => (
                <TableRow key={profile.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{profile.email}</TableCell>
                  <TableCell>{getSubscriptionBadge(profile.subscription_level)}</TableCell>
                  <TableCell>{formatDate(profile.expires_at)}</TableCell>
                  <TableCell>{formatDate(profile.created_at)}</TableCell>
                  <TableCell>{formatDate(profile.updated_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingProfile(profile)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Profile Dialog */}
      {editingProfile && (
        <EditProfileDialog
          profile={editingProfile}
          onClose={() => setEditingProfile(null)}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* Add Profile Dialog */}
      {showAddDialog && (
        <AddProfileDialog
          onClose={() => setShowAddDialog(false)}
          onProfileAdded={handleProfileAdded}
        />
      )}
    </div>
  )
}