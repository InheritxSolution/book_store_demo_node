import { HttpStatus, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateBookDto } from '../src/modules/books/dto/create-book.dto';
import { recordStatus } from '../src/common/enums/crud.enum';
import { Messages } from '../src/common/constant/message';
import {HttpExceptionFilter} from '../src/common/exceptions/http.exception';



describe('BookController (e2e)', () => {
  let authUrl = 'http://localhost:3000'

  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());

    // For validation
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    authUrl = app.getHttpServer()
  });

  const mockBook: CreateBookDto = {
    bookName: 'Harry Potter',
    isbn: '1234567890123',
  };

  let bookId;

  /*
   #######################
   ADD BOOK TEST CASES
   #######################  
  */

  // Test case : add new book with valid data
  describe('/books/ [POST]', () => {
    it('it should create a book and return created book', () => {
      return request(authUrl)
        .post('/books')
        .set('Accept', 'application/json')
        .send(mockBook)
        .expect((response: any) => {
          const { id, bookName, isbn, status } = response.body.data;
          bookId = id;
          expect(typeof id).toBe('string'),
            expect(bookName).toEqual(mockBook.bookName),
            expect(isbn).toEqual(mockBook.isbn),
            expect(status).toEqual(recordStatus.CREATED);
        })
        .expect(HttpStatus.CREATED);
    });
  });

  // Test case : add new book with same book name that is already exist
  describe('/books/ [POST]', () => {
    it('it should give an error book is already exists', () => {
      return request(authUrl)
        .post('/books')
        .set('Accept', 'application/json')
        .send(mockBook)
        .expect((response: any) => {
          expect(response.body.message).toEqual(
            new Messages().messages.BOOK_EXIST,
          );
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  // Test case : add new book with same isbn, that is alredy assigned to other book
  describe('/books/ [POST]', () => {
    it('it should give an error isbn already exists', () => {
      let book = {...mockBook}
      book.bookName = 'New Test Book';
      return request(authUrl)
        .post('/books')
        .set('Accept', 'application/json')
        .send(book)
        .expect((response: any) => {
          expect(response.body.message).toEqual(
            new Messages().messages.ISBN_EXIST,
          );
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  // Test case : add new book without book name
  describe('/books/ [POST]', () => {
    it('it should give an error, bookname should not be empty', () => {
      let book = { ...mockBook };
      delete book.bookName;
      return request(authUrl)
        .post('/books')
        .set('Accept', 'application/json')
        .send(book)
        .expect((response: any) => {
          console.log(response.body)
          expect(response.body.message[0]).toEqual(
            'bookName should not be empty',
          );
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  // Test case : add new book without isbn
  describe('/books/ [POST]', () => {
    it('it should give an error, isbn should not be empty', () => {
      let book = { ...mockBook };
      delete book.isbn;
      return request(authUrl)
        .post('/books')
        .set('Accept', 'application/json')
        .send(book)
        .expect((response: any) => {
          expect(response.body.message[1]).toEqual('isbn should not be empty');
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  // Test case : add new book with inavalid isbn
  describe('/books/ [POST]', () => {
    it('it should give an error, isbn not valid', () => {
      let book = { ...mockBook };
      book.isbn = '1234456';
      return request(authUrl)
        .post('/books')
        .set('Accept', 'application/json')
        .send(book)
        .expect((response: any) => {
          expect(response.body.message[0]).toEqual(
            'isbn must be longer than or equal to 13 characters',
          );
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });

  /*
   #######################
    LIST BOOK TEST CASES
   #######################  
  */

  // Test case : fetch book list
  describe('/books/ [GET]', () => {
    it('it should give only one record with status 1', () => {
      return request(authUrl)
        .get('/books')
        .send()
        .expect((response: any) => {
          console.log(response.body.data)

          expect(response.body.data.length).toEqual(1);
          expect(response.body.data[0].status).toEqual(1);
        })
        .expect(HttpStatus.OK);
    });
  });

  /*
   #######################
    GET BOOK TEST CASES
   #######################  
  */

  // Test case : fetch book with valid id
  describe('/books/:id [GET]', () => {
    it('it should give valid book record', () => {
      return request(authUrl)
        .get(`/books/${bookId}`)
        .send()
        .expect((response: any) => {
          expect(response.body.data.bookName).toEqual(mockBook.bookName);
          expect(response.body.data.isbn).toEqual(mockBook.isbn);
        })
        .expect(HttpStatus.OK);
    });
  });

  // Test case : fetch book with invalid id
  describe('/books/:id [GET]', () => {
    it('it should give, book not foud', () => {
      return request(authUrl)
        .get(`/books/2fa6201c-b68f-489c-82df-f1a473a127d9`)
        .send()
        .expect((response: any) => {
          expect(response.body.message).toEqual(
            new Messages().messages.BOOK_NOT_FOUND,
          );
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  /*
   #######################
    UPDATE BOOK TEST CASES
   #######################  
  */

  // Test case : update book with invalid id
  describe('/books/:id [PUT]', () => {
    it('it should give an error, book not found', () => {
      let book = { bookName: 'New Book', isbn: '123455' };
      return request(authUrl)
        .put(`/books/2fa6201c-b68f-489c-82df-f1a473a127d9`)
        .set('Accept', 'application/json')
        .send(book)
        .expect((response: any) => {
          expect(response.body.message).toEqual(
            new Messages().messages.BOOK_NOT_FOUND,
          );
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  // Test case : update book with valid data
  describe('/books/:id [PUT]', () => {
    it('it should return updated record', () => {
      let book = { bookName: 'New Book', isbn: '123455' };
      return request(authUrl)
        .put(`/books/${bookId}`)
        .set('Accept', 'application/json')
        .send(book)
        .expect((response: any) => {
          expect(response.body.data.bookName).toEqual(book.bookName);
          expect(response.body.data.isbn).toEqual(mockBook.isbn);
          expect(response.body.data.status).toEqual(recordStatus.UPDATED);
        })
        .expect(HttpStatus.OK);
    });
  });

  // Test case : update book with existing book name
  describe('/books/:id [PUT]', () => {
    it('it should give an error, bookname already exist', () => {
      mockBook.isbn = '2345678901234'
      request(authUrl)
        .put(`/books/${bookId}`)
        .set('Accept', 'application/json')
        .send(mockBook)
        .expect((response: any) => {
          
          let book = { bookName: 'New Book' };
          return request(authUrl)
            .put(`/${response.body.data.id}`)
            .set('Accept', 'application/json')
            .send(book)
            .expect((response: any) => {
              expect(response.body.message).toEqual(
                new Messages().messages.BOOK_EXIST,
              );
            })
            .expect(HttpStatus.BAD_REQUEST);
        });
    });
  });

  /*
   #######################
    DELETE BOOK TEST CASES
   #######################  
  */

  // Test case : delete book with invalid id
  describe('/books/:id [DELETE]', () => {
    it('it should give an error, book not found', () => {
      return request(authUrl)
        .delete(`/books/2fa6201c-b68f-489c-82df-f1a473a127d9`)
        .send()
        .expect((response: any) => {
          expect(response.body.message).toEqual(
            new Messages().messages.BOOK_NOT_FOUND,
          );
        })
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  // Test case : delete book with valid id
  describe('/books/:id [DELETE]', () => {
    it('it should change the staus of record to deleted', () => {
      return request(authUrl)
        .delete(`/books/${bookId}`)
        .send()
        .expect((response: any) => {
          expect(response.body.message).toEqual(
            new Messages().messages.BOOK_DELETED,
          );
          expect(response.body.data.status).toEqual(recordStatus.DELETED);
        })
        .expect(HttpStatus.OK);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
