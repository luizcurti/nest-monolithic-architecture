
import { Repository } from 'typeorm';
import { User } from '../../models/users.model';
import { UsersRepository } from '../user.repository.interface';

export class UsersTypeOrmRepository implements UsersRepository {
    constructor(private usersRepository: Repository<User>) { }

    async create(data: Pick<User, 'name' | 'email'>) {
        return this.usersRepository.save(data);
    }

    async findAll() {
        return this.usersRepository.find();
    }

    async findById(id: number) {
        return this.usersRepository.findOneBy({ id }) ?? null;
    }

    async update(id: number, data: Partial<Pick<User, 'name' | 'email'>>) {
        await this.usersRepository.update(id, data);
        return this.usersRepository.findOneBy({ id }) ?? null;
    }

    async delete(id: number) {
        await this.usersRepository.delete(id);
    }
}