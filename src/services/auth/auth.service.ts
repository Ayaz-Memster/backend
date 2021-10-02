import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { UserDto } from '../../contract/user';
import { UserRepository } from '../../services/user/user.repository';

@Injectable()
export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}

  async register(username: string, password: string): Promise<void> {
    const passwordHash = this.hash(password);
    await this.userRepository.createUser(username, passwordHash);
  }

  async authenticate(username: string, password: string) {
    const passwordHash = this.hash(password);
    await this.userRepository.authenticate(username, passwordHash);
  }

  async getUser(username: string): Promise<UserDto> {
    return this.userRepository.getUser(username);
  }

  private hash(input: string): string {
    return createHash('sha512').update(input).digest('base64');
  }
}
