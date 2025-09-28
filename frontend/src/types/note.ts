export interface Note {
  _id: string;
  title: string;
  content: string;
  userId: string;
  tags: string[];
  isPinned: boolean;
  backgroundColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  tags?: string[];
  backgroundColor?: string;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
  backgroundColor?: string;
  isPinned?: boolean;
}

export interface NotesResponse {
  success: boolean;
  message?: string;
  data: {
    notes: Note[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface NoteResponse {
  success: boolean;
  message?: string;
  data: {
    note: Note;
  };
}

export interface NotesStats {
  totalNotes: number;
  pinnedNotes: number;
  topTags: Array<{
    tag: string;
    count: number;
  }>;
}