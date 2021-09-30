import { Injectable } from '@nestjs/common';
import { IDocumentSession } from 'ravendb';
import { UserDto } from 'src/contract/user';
import { User, usersCollection } from 'src/domain/user';
import { AlreadyExistsError } from 'src/errors/AlreadyExistsError';
import { NotFoundError } from 'src/errors/NotFoundError';
import { UnauthorizedError } from 'src/errors/UnauthorizedError';
import { WrongPasswordError } from 'src/errors/WrongPasswordError';
import { RavenService } from 'src/services/raven/raven.service';

@Injectable()
export class UserRepository {
  private readonly session: IDocumentSession;

  constructor(ravenService: RavenService) {
    this.session = ravenService.openSession();
  }

  async authenticate(username: string, passwordHash: string): Promise<void> {
    const user = await this.collection
      .whereEquals('username', username)
      .singleOrNull();
    if (user === null) {
      throw new NotFoundError('User not found');
    }
    if (passwordHash !== user.password) {
      throw new WrongPasswordError();
    }
    if (!user.canAccess) {
      throw new UnauthorizedError('Access is denied');
    }
  }

  async createUser(username: string, passwordHash: string): Promise<void> {
    const user = await this.collection
      .whereEquals('username', username)
      .singleOrNull();
    if (user !== null) {
      throw new AlreadyExistsError('User already exists');
    }
    const newUser: User = {
      username: username,
      password: passwordHash,
      canAccess: false,
      canEdit: false,
      collection: usersCollection,
    };
    await this.session.store(newUser);
    await this.session.saveChanges();
  }

  async getUser(username: string): Promise<UserDto> {
    const user = await this.collection
      .whereEquals('username', username)
      .single();
    return {
      username: user.username,
      canEdit: user.canEdit,
    };
  }

  private get collection() {
    return this.session.query<User>({ collection: usersCollection });
  }
}
