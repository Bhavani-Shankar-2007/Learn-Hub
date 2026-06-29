import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { Book, FileText, Download } from 'lucide-react';

interface BookItem {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  pdfUrl: string;
  price: number;
}

export default function Library() {
  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const { data } = await api.get('/books');
        setBooks(data);
      } catch (err) {
        setError('Failed to load library');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);

  const handlePurchase = async (bookId: string, price: number) => {
    try {
      // Create order
      const { data: orderData } = await api.post('/books/order', { bookId });
      
      if (orderData.mock) {
        alert('Mock payment successful! Book added to your library.');
        return;
      }

      // If real Razorpay
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "LearnHub",
        description: "Book Purchase",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            await api.post('/books/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookId,
            });
            alert('Payment successful!');
          } catch (err) {
            alert('Payment verification failed');
          }
        },
        theme: {
          color: "#4f46e5"
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Purchase setup failed');
    }
  };

  if (loading) return <div className="flex justify-center p-12 text-zinc-400">Loading books...</div>;
  if (error) return <div className="text-red-500 p-4 bg-red-500/10 rounded-lg">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Book Library</h1>
      <p className="text-zinc-400 mb-8">Purchase premium resources to accelerate your learning.</p>
      
      {books.length === 0 ? (
        <div className="text-center p-12 bg-zinc-900 border border-zinc-800 rounded-xl">
          <Book className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No books available</h3>
          <p className="text-zinc-400">Our library is currently empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {books.map(book => (
            <div key={book.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden flex flex-col group">
              <div className="h-64 bg-zinc-800 flex items-center justify-center relative">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition" />
                ) : (
                  <FileText className="h-20 w-20 text-zinc-700" />
                )}
                <div className="absolute top-3 right-3 bg-indigo-600 text-white font-bold px-3 py-1 rounded-full text-sm shadow-lg">
                  ₹{book.price}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{book.title}</h3>
                <p className="text-zinc-400 text-sm mb-4 line-clamp-2 flex-1">
                  {book.description || 'No description provided.'}
                </p>
                <button 
                  onClick={() => handlePurchase(book.id, book.price)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition"
                >
                  <Download size={16} /> Purchase Book
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
