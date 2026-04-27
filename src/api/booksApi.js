const OPENLIBRARY_SEARCH_URL = 'https://openlibrary.org/search.json';
const OPENLIBRARY_COVER_URL = 'https://covers.openlibrary.org/b/id';

const FALLBACK_BOOKS = [
  {
    id: "fallback-1",
    title: "El Principito",
    author_name: ["Antoine de Saint-Exupéry"],
    first_publish_year: 1943,
    cover_i: 10000001,
    subject: ["Clásicos", "Ficción"],
    description: "Un clásico de la literatura mundial que narra la historia de un piloto perdido en el desierto."
  },
  {
    id: "fallback-2",
    title: "Cien años de soledad",
    author_name: ["Gabriel García Márquez"],
    first_publish_year: 1967,
    cover_i: 10000002,
    subject: ["Realismo mágico", "Novela"],
    description: "La historia de la familia Buendía a lo largo de siete generaciones."
  },
  {
    id: "fallback-3",
    title: "1984",
    author_name: ["George Orwell"],
    first_publish_year: 1949,
    cover_i: 10000003,
    subject: ["Ciencia Ficción", "Distopía"],
    description: "Una distopía que explora los peligros del totalitarismo."
  },
  {
    id: "fallback-4",
    title: "El Hobbit",
    author_name: ["J.R.R. Tolkien"],
    first_publish_year: 1937,
    cover_i: 10000004,
    subject: ["Fantasía", "Aventura"],
    description: "La aventura de Bilbo Bolsón en la Tierra Media."
  },
  {
    id: "fallback-5",
    title: "Don Quijote de la Mancha",
    author_name: ["Miguel de Cervantes"],
    first_publish_year: 1605,
    cover_i: 10000005,
    subject: ["Clásicos", "Novela"],
    description: "La historia del ingenioso hidalgo Don Quijote."
  },
  {
    id: "fallback-6",
    title: "Sapiens",
    author_name: ["Yuval Noah Harari"],
    first_publish_year: 2011,
    cover_i: 10000006,
    subject: ["Historia", "No Ficción"],
    description: "Una breve historia de la humanidad."
  }
];

const normalizeOpenLibraryBook = (rawBook) => {
  const coverId = rawBook.cover_i;
  const coverUrl = coverId 
    ? `${OPENLIBRARY_COVER_URL}/${coverId}-M.jpg` 
    : 'https://placehold.co/200x300/3b82f6/white?text=Libro';
    
  return {
    id: rawBook.key?.replace('/works/', '') || `book-${Date.now()}`,
    volumeInfo: {
      title: rawBook.title || 'Sin título',
      authors: rawBook.author_name || ['Autor desconocido'],
      description: rawBook.description || rawBook.first_sentence?.[0] || 'Sin descripción disponible.',
      imageLinks: { thumbnail: coverUrl },
      categories: rawBook.subject || ['General'],
      pageCount: rawBook.number_of_pages_median || 0,
      publishedDate: rawBook.first_publish_year ? `${rawBook.first_publish_year}` : 'Fecha desconocida',
      publisher: rawBook.publisher?.[0] || 'Editorial desconocida',
      language: rawBook.language?.[0] || 'es',
      averageRating: rawBook.ratings_average || 0,
      ratingsCount: rawBook.ratings_count || 0
    },
    saleInfo: { listPrice: { amount: 14.99, currencyCode: 'USD' } }
  };
};

export const searchBooks = async (query = 'programming', startIndex = 0, maxResults = 24) => {
  if (!query || query.trim() === '') {
    query = 'programming';
  }
  
  try {
    const encodedQuery = encodeURIComponent(query.trim());
    const url = `${OPENLIBRARY_SEARCH_URL}?q=${encodedQuery}&limit=${maxResults}&offset=${startIndex}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    if (!data.docs || data.docs.length === 0) {
      return getFallbackBooks(query);
    }
    
    const books = data.docs.slice(0, maxResults).map(normalizeOpenLibraryBook);
    
    return {
      success: true,
      books: books,
      totalItems: data.num_found || books.length,
      fromCache: false
    };
  } catch (error) {
    console.error('Error en OpenLibrary:', error);
    return getFallbackBooks(query);
  }
};

export const getFallbackBooks = (query = '') => {
  let filteredBooks = [...FALLBACK_BOOKS];
  
  if (query && query !== 'programming' && query !== 'libros populares') {
    const searchLower = query.toLowerCase();
    filteredBooks = FALLBACK_BOOKS.filter(book => 
      book.title.toLowerCase().includes(searchLower) ||
      book.author_name.some(author => author.toLowerCase().includes(searchLower)) ||
      book.subject.some(subj => subj.toLowerCase().includes(searchLower))
    );
  }
  
  if (filteredBooks.length === 0) {
    filteredBooks = [...FALLBACK_BOOKS];
  }
  
  const books = filteredBooks.map(book => ({
    id: book.id,
    volumeInfo: {
      title: book.title,
      authors: book.author_name,
      description: book.description,
      imageLinks: { thumbnail: `https://placehold.co/200x300/3b82f6/white?text=${encodeURIComponent(book.title)}` },
      categories: book.subject,
      pageCount: 0,
      publishedDate: book.first_publish_year ? `${book.first_publish_year}` : 'Fecha desconocida',
      publisher: 'Editorial',
      language: 'es',
      averageRating: 0,
      ratingsCount: 0
    },
    saleInfo: { listPrice: { amount: 14.99, currencyCode: 'USD' } }
  }));
  
  return {
    success: false,
    books: books,
    totalItems: books.length,
    fromCache: true,
    error: 'Usando catálogo local'
  };
};

export const getBookById = async (id) => {
  if (!id) return { success: false, book: null };
  
  if (id.startsWith('fallback-')) {
    const fallbackBook = FALLBACK_BOOKS.find(book => book.id === id);
    if (fallbackBook) {
      const normalized = {
        id: fallbackBook.id,
        volumeInfo: {
          title: fallbackBook.title,
          authors: fallbackBook.author_name,
          description: fallbackBook.description,
          imageLinks: { thumbnail: `https://placehold.co/400x600/3b82f6/white?text=${encodeURIComponent(fallbackBook.title)}` },
          categories: fallbackBook.subject,
          pageCount: 0,
          publishedDate: fallbackBook.first_publish_year ? `${fallbackBook.first_publish_year}` : 'Fecha desconocida',
          publisher: 'Editorial',
          language: 'es',
          averageRating: 0,
          ratingsCount: 0
        },
        saleInfo: { listPrice: { amount: 14.99, currencyCode: 'USD' } }
      };
      return { success: true, book: normalized };
    }
  }
  
  try {
    const url = `https://openlibrary.org/works/${id}.json`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    
    const editionsUrl = `https://openlibrary.org/works/${id}/editions.json?limit=1`;
    const editionsResponse = await fetch(editionsUrl);
    const editionsData = await editionsResponse.json();
    const firstEdition = editionsData.entries?.[0];
    const coverId = firstEdition?.covers?.[0];
    
    const normalizedBook = {
      id: id,
      volumeInfo: {
        title: data.title || 'Sin título',
        authors: data.authors?.map(a => a.name) || ['Autor desconocido'],
        description: data.description?.value || data.description || 'Sin descripción disponible.',
        imageLinks: { thumbnail: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : 'https://placehold.co/400x600/3b82f6/white?text=Libro' },
        categories: data.subjects || ['General'],
        pageCount: firstEdition?.number_of_pages || 0,
        publishedDate: data.first_publish_date || 'Fecha desconocida',
        publisher: firstEdition?.publishers?.[0] || 'Editorial',
        language: 'es',
        averageRating: 0,
        ratingsCount: 0
      },
      saleInfo: { listPrice: { amount: 14.99, currencyCode: 'USD' } }
    };
    
    return { success: true, book: normalizedBook };
  } catch (error) {
    const fallbackResult = getFallbackBooks();
    return { success: false, book: fallbackResult.books[0] };
  }
};

export const getRecommendations = async () => {
  const terms = ['fiction', 'science', 'history', 'art', 'programming'];
  const randomTerm = terms[Math.floor(Math.random() * terms.length)];
  return await searchBooks(randomTerm, 0, 8);
};