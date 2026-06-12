const API_BASE = '/api';

export async function fetchBooks() {
  const res = await fetch(`${API_BASE}/books`);
  return res.json();
}

export async function uploadBook(file: File, title: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  
  const res = await fetch(`${API_BASE}/books/upload`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}

export async function fetchBook(id: number) {
  const res = await fetch(`${API_BASE}/books/${id}`);
  return res.json();
}

export async function deleteBook(id: number) {
  const res = await fetch(`${API_BASE}/books/${id}`, {
    method: 'DELETE',
  });
  return res.json();
}

export async function fetchConversations(bookId?: number) {
  const url = bookId
    ? `${API_BASE}/conversations?bookId=${bookId}`
    : `${API_BASE}/conversations`;
  const res = await fetch(url);
  return res.json();
}

export async function createConversation(bookId: number, teacherId?: number, title?: string) {
  const res = await fetch(`${API_BASE}/conversations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId, teacherId, title }),
  });
  return res.json();
}

export async function fetchMessages(conversationId: number) {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`);
  return res.json();
}

export async function sendMessage(conversationId: number, message: string) {
  const res = await fetch(`${API_BASE}/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  return res.body;
}

export async function fetchTeachers() {
  const res = await fetch(`${API_BASE}/teachers`);
  return res.json();
}

export async function createTeacher(data: {
  name: string;
  style?: string;
  tone?: string;
  maxLength?: number;
  customPrompt?: string;
}) {
  const res = await fetch(`${API_BASE}/teachers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchProgress(bookId: number) {
  const res = await fetch(`${API_BASE}/progress/${bookId}`);
  return res.json();
}

export async function fetchDashboard(bookId: number) {
  const res = await fetch(`${API_BASE}/progress/${bookId}/dashboard`);
  return res.json();
}

export async function fetchLearningPath(bookId: number) {
  const res = await fetch(`${API_BASE}/progress/${bookId}/path`);
  return res.json();
}

export async function fetchPendingReviews() {
  const res = await fetch(`${API_BASE}/review/pending`);
  return res.json();
}

export async function startReview(conceptId: number) {
  const res = await fetch(`${API_BASE}/review/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conceptId }),
  });
  return res.json();
}

export async function submitReview(conceptId: number, score: number) {
  const res = await fetch(`${API_BASE}/review/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conceptId, score }),
  });
  return res.json();
}

export async function fetchNotes(bookId: number) {
  const res = await fetch(`${API_BASE}/notes/${bookId}`);
  return res.json();
}

export async function createNote(bookId: number, content: string, conversationId?: number) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookId, content, conversationId }),
  });
  return res.json();
}

export async function transcribeAudio(audioBlob: Blob) {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  
  const res = await fetch(`${API_BASE}/asr/transcribe`, {
    method: 'POST',
    body: formData,
  });
  return res.json();
}
