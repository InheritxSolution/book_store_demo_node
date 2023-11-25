import {
  BadRequestException,
  ExceptionFilter,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Messages } from 'src/common/constant/message';
import { recordStatus } from 'src/common/enums/crud.enum';
import { Exception } from 'src/common/exceptions/exception';
import { Not, Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService extends Exception {
  constructor(
    @InjectRepository(Book) private readonly bookRepository: Repository<Book>,
  ) {
    super();
  }

  messages = new Messages().messages;

  async create(createBookDto: CreateBookDto) {
    try {
      let book = await this.bookRepository.findOne({
        where: [
          {
            bookName: createBookDto.bookName,
            status: Not(recordStatus.DELETED),
          },
          { isbn: createBookDto.isbn, status: Not(recordStatus.DELETED) },
        ],
      });

      // check if book already exists or not
      if (book) {
        if (book.bookName == createBookDto.bookName)
          throw new BadRequestException(this.messages.BOOK_EXIST);
        else throw new BadRequestException(this.messages.ISBN_EXIST);
      }

      let bookRecord = this.bookRepository.create({
        bookName: createBookDto.bookName,
        isbn: createBookDto.isbn,
      });

      book = await this.bookRepository.save(bookRecord);

      return {
        statusCode: 201,
        success: true,
        message: this.messages.BOOK_CREATED,
        data: book,
      };
    } catch (err) {
      this.throwException(err);
    }
  }

  async findAll() {
    try {
      let books = await this.bookRepository.find({
        where: { status: Not(recordStatus.DELETED) },
      });
      return { statusCode: 200, success: true, data: books };
    } catch (err) {
      this.throwException(err);
    }
  }

  async findOne(id: string) {
    try {
      let book = await this.bookRepository.findOne({
        where: { id: id, status: Not(recordStatus.DELETED) },
      });

      if (!book) {
        throw new NotFoundException(this.messages.BOOK_NOT_FOUND);
      }
      return { statusCode: 200, success: true, data: book };
    } catch (err) {
      this.throwException(err);
    }
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    try {
      let { data } = await this.findOne(id);

      let book = await this.bookRepository.findOne({
        where: [
          {
            bookName: updateBookDto.bookName,
            status: Not(recordStatus.DELETED),
          },
        ],
      });

      if (book) {
        throw new BadRequestException(this.messages.BOOK_EXIST);
      }

      data.bookName = updateBookDto.bookName;
      data.status = recordStatus.UPDATED;

      await this.bookRepository.save(data);

      return {
        statusCode: 200,
        success: true,
        message: this.messages.BOOK_UPADTED,
        data: data,
      };
    } catch (err) {
      this.throwException(err);
    }
  }

  async remove(id: string) {
    try {
      let { data } = await this.findOne(id);
      data.status = recordStatus.DELETED;
      await this.bookRepository.save(data);

      return {
        statusCode: 200,
        success: true,
        message: this.messages.BOOK_DELETED,
        data: data,
      };
    } catch (err) {
      this.throwException(err);
    }
  }
}
