import dotenv from 'dotenv';
dotenv.config();

const testAdminBooksAPI = async () => {
  try {
    console.log('🧪 Testing Admin Books API...');
    
    const response = await fetch('https://portfolio-x0gj.onrender.com/api/books/admin/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'admin-key': 'admin123' // Using old admin key for testing
      }
    });
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`);
      return;
    }
    
    const data = await response.json();
    
    console.log('📊 API Response:');
    console.log('Success:', data.success);
    console.log('Books count:', data.books?.length || 0);
    
    if (data.books && data.books.length > 0) {
      console.log('\n📚 First book details:');
      const firstBook = data.books[0];
      console.log('ID:', firstBook.id);
      console.log('Book ID:', firstBook.bookId);
      console.log('Title:', firstBook.title);
      console.log('Images:', firstBook.images);
      console.log('Images length:', firstBook.images?.length || 0);
      
      if (firstBook.images && firstBook.images.length > 0) {
        console.log('✅ First image URL:', firstBook.images[0]);
      } else {
        console.log('❌ No images found');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

testAdminBooksAPI();
