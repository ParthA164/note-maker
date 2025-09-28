import ApiService from './api';
import { Note, CreateNoteData, UpdateNoteData, NotesResponse, NoteResponse, NotesStats } from '../types/note';
import { ApiResponse } from '../types/api';

export class NotesService {
  async getNotes(params?: {
    search?: string;
    tag?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  }): Promise<NotesResponse> {
    const response = await ApiService.get<{
      notes: Note[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>('/notes', params);
    return response as NotesResponse;
  }

  async getNote(id: string): Promise<NoteResponse> {
    const response = await ApiService.get<{ note: Note }>(`/notes/${id}`);
    return response as NoteResponse;
  }

  async createNote(data: CreateNoteData): Promise<NoteResponse> {
    const response = await ApiService.post<{ note: Note }>('/notes', data);
    return response as NoteResponse;
  }

  async updateNote(id: string, data: UpdateNoteData): Promise<NoteResponse> {
    const response = await ApiService.put<{ note: Note }>(`/notes/${id}`, data);
    return response as NoteResponse;
  }

  async deleteNote(id: string): Promise<ApiResponse> {
    return ApiService.delete(`/notes/${id}`);
  }

  async togglePin(id: string): Promise<NoteResponse> {
    const response = await ApiService.patch<{ note: Note }>(`/notes/${id}/pin`);
    return response as NoteResponse;
  }

  async getStats(): Promise<ApiResponse<NotesStats>> {
    return ApiService.get<NotesStats>('/notes/stats/summary');
  }
}

const notesService = new NotesService();
export default notesService;