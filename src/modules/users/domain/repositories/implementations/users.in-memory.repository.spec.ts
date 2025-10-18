import { UsersInMemoryRepository } from './users.in-memory.repository';
import { User } from '../../models/users.model';

describe('UsersInMemoryRepository', () => {
  let repository: UsersInMemoryRepository;

  beforeEach(() => {
    repository = new UsersInMemoryRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and return it', async () => {
      
      const user: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      };
  
      const result = await repository.create(user);
      
      expect(result).toEqual(user);
    });

    it('should add user to internal array', async () => {
      
      const user: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',  
      };
  
      await repository.create(user);
      const allUsers = await repository.findAll();
      
      expect(allUsers).toHaveLength(1);
      expect(allUsers[0]).toEqual(user);
    });

    it('should handle multiple users', async () => {
      
      const user1: User = {
        id: 1,
        name: 'User 1',
        email: 'user1@example.com',
      };
      const user2: User = {
        id: 2,
        name: 'User 2',
        email: 'user2@example.com',
      };
  
      await repository.create(user1);
      await repository.create(user2);
      const allUsers = await repository.findAll();
      
      expect(allUsers).toHaveLength(2);
      expect(allUsers).toContain(user1);
      expect(allUsers).toContain(user2);
    });
  });

  describe('findAll', () => {
    it('should return empty array initially', async () => {
  
      const result = await repository.findAll();
      
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return all created users', async () => {
      
      const users: User[] = [
        { id: 1, name: 'User 1', email: 'user1@example.com' },
        { id: 2, name: 'User 2', email: 'user2@example.com' },
        { id: 3, name: 'User 3', email: 'user3@example.com' },
      ];
  
      for (const user of users) {
        await repository.create(user);
      }
      const result = await repository.findAll();
      
      expect(result).toHaveLength(3);
      expect(result).toEqual(users);
    });

    it('should return reference to same array on multiple calls', async () => {
      
      const user: User = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      };
      await repository.create(user);
  
      const result1 = await repository.findAll();
      const result2 = await repository.findAll();
      
      expect(result1).toBe(result2);
      expect(result1).toEqual(result2);
    });
  });
});