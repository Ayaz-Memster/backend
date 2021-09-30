import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Error } from 'src/contract/error';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getResponse();
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string = 'Internal server error';

    if (exception instanceof Error) {
      console.error(exception.name, exception.message);
      switch (exception.name) {
        case 'AlreadyExistsError':
          status = HttpStatus.BAD_REQUEST;
          message = exception.message;
          break;
        case 'InvalidArgumentError':
          status = HttpStatus.BAD_REQUEST;
          message = exception.message;
          break;
        case 'NotFoundError':
          status = HttpStatus.NOT_FOUND;
          message = exception.message;
          break;
        case 'UnauthorizedError':
          status = HttpStatus.UNAUTHORIZED;
          message = exception.message;
          break;
        case 'WrongPasswordError':
          status = HttpStatus.UNAUTHORIZED;
          message = exception.message;
          break;
        case 'UnauthorizedException':
          status = HttpStatus.UNAUTHORIZED;
          message = 'Authentication required';
      }
    }

    const error: Error = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    response.status(status).json(error);
  }
}
