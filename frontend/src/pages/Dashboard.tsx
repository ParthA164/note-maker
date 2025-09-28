import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Pin, Trash2, Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotesService from '../services/notes';
import { Note } from '../types/note';
import { getErrorMessage, formatDate, truncateText } from '../utils/helpers';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    backgroundColor: '#ffffff'
  });

  const fetchNotesCallback = useCallback(async (params?: any) => {
    try {
      const response = await NotesService.getNotes(params);
      if (response.success) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotesCallback();
  }, [fetchNotesCallback]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        fetchNotesCallback({ search: searchTerm });
      } else {
        fetchNotesCallback();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, fetchNotesCallback]);



  const handleCreateNote = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const response = await NotesService.createNote({
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags,
        backgroundColor: formData.backgroundColor
      });

      if (response.success) {
        setNotes([response.data.note, ...notes]);
        setFormData({ title: '', content: '', tags: [], backgroundColor: '#ffffff' });
        setIsCreating(false);
        toast.success('Note created successfully!');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleEditNote = async () => {
    if (!selectedNote || !formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const response = await NotesService.updateNote(selectedNote._id, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags,
        backgroundColor: formData.backgroundColor
      });

      if (response.success) {
        setNotes(notes.map(note => 
          note._id === selectedNote._id ? response.data.note : note
        ));
        setSelectedNote(response.data.note);
        setIsEditing(false);
        toast.success('Note updated successfully!');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const startEditing = () => {
    if (selectedNote) {
      setFormData({
        title: selectedNote.title,
        content: selectedNote.content,
        tags: selectedNote.tags || [],
        backgroundColor: selectedNote.backgroundColor || '#ffffff'
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData({ title: '', content: '', tags: [], backgroundColor: '#ffffff' });
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;

    try {
      await NotesService.deleteNote(noteId);
      setNotes(notes.filter(note => note._id !== noteId));
      if (selectedNote?._id === noteId) {
        setSelectedNote(null);
      }
      toast.success('Note deleted successfully!');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleTogglePin = async (noteId: string) => {
    try {
      const response = await NotesService.togglePin(noteId);
      if (response.success) {
        setNotes(notes.map(note => 
          note._id === noteId ? response.data.note : note
        ));
        if (selectedNote?._id === noteId) {
          setSelectedNote(response.data.note);
        }
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your notes..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-sm border-b border-white/50 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">NotesApp</h1>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-bold text-white">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:bg-gray-100 rounded-xl">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Your Notes</h2>
                <Button
                  size="sm"
                  onClick={() => {
                    setIsCreating(true);
                    setSelectedNote(null);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Notes List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    {searchTerm ? 'No notes found' : 'No notes yet. Create your first note!'}
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note._id}
                      onClick={() => {
                        setSelectedNote(note);
                        setIsCreating(false);
                        setIsEditing(false);
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedNote?._id === note._id
                          ? 'bg-primary-50 border-primary-200'
                          : 'hover:bg-gray-50 border-transparent'
                      } border`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            {note.isPinned && (
                              <Pin className="w-3 h-3 text-primary-500 flex-shrink-0" />
                            )}
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {note.title}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {truncateText(note.content, 50)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(note.updatedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Welcome Message */}
            {!selectedNote && !isCreating && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8 mb-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">
                      {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome, {user?.firstName} {user?.lastName}!
                  </h1>
                  <p className="text-gray-600 mb-6">
                    Email: {user?.email}
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                    <p className="text-gray-700 mb-4">
                      Ready to capture your thoughts and ideas? Start by creating your first note or select an existing one from the sidebar.
                    </p>
                    <Button
                      onClick={() => {
                        setIsCreating(true);
                        setSelectedNote(null);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Note
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow">
              {isCreating ? (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Create New Note</h2>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setIsCreating(false)}>
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleCreateNote}>
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label="Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter note title..."
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content
                      </label>
                      <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Write your note here..."
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              ) : selectedNote ? (
                isEditing ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">Edit Note</h2>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={cancelEditing}>
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleEditNote}>
                          Save Changes
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Enter note title..."
                      />
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Content
                        </label>
                        <textarea
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          placeholder="Write your note here..."
                          rows={12}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedNote.title}
                      </h2>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startEditing}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTogglePin(selectedNote._id)}
                        >
                          <Pin className={`w-4 h-4 ${selectedNote.isPinned ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteNote(selectedNote._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-gray-700">
                        {selectedNote.content}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>Created: {formatDate(selectedNote.createdAt)}</span>
                        <span>Updated: {formatDate(selectedNote.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <Edit className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a note to view
                  </h3>
                  <p className="text-gray-500">
                    Choose a note from the sidebar or create a new one to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;