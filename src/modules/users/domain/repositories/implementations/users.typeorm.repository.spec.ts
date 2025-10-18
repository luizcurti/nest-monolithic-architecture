import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { UsersTypeOrmRepository } from './users.typeorm.repository';
import { User } from '../../models/users.model';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('UsersTypeOrmRepository', () => {
  let repository: UsersTypeOrmRepository;
  let mockTypeOrmRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    mockTypeOrmRepository = {
      insert: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UsersTypeOrmRepository,
          useFactory: () => new UsersTypeOrmRepository(mockTypeOrmRepository),
        },
      ],
    })
    .setLogger(mockLogger)
    .compile();

    repository = module.get<UsersTypeOrmRepository>(UsersTypeOrmRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    const testUser: User = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    };

    it('should create a user successfully', async () => {
      
      const insertResult = { identifiers: [{ id: 1 }], generatedMaps: [], raw: [] };
      mockTypeOrmRepository.insert.mockResolvedValue(insertResult as any);
  
      const result = await repository.create(testUser);
      
      expect(mockTypeOrmRepository.insert).toHaveBeenCalledWith(testUser);
      expect(result).toEqual(testUser);
    });

    it('should handle database errors during creation', async () => {
      
      const error = new Error('Database connection failed');
      mockTypeOrmRepository.insert.mockRejectedValue(error);
  
      await expect(repository.create(testUser)).rejects.toThrow('Database connection failed');
    });

    it('should pass correct data to TypeORM insert', async () => {
      
      const insertResult = { identifiers: [{ id: 1 }], generatedMaps: [], raw: [] };
      mockTypeOrmRepository.insert.mockResolvedValue(insertResult as any);
  
      await repository.create(testUser);
      
      expect(mockTypeOrmRepository.insert).toHaveBeenCalledWith(testUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      
      const mockUsers = [mockUser, { ...mockUser, id: 2, name: 'User 2' }];
      mockTypeOrmRepository.find.mockResolvedValue(mockUsers);
  
      const result = await repository.findAll();
      
      expect(mockTypeOrmRepository.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      
      mockTypeOrmRepository.find.mockResolvedValue([]);
  
      const result = await repository.findAll();
      
      expect(mockTypeOrmRepository.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle database errors during find', async () => {
      
      const error = new Error('Database query failed');
      mockTypeOrmRepository.find.mockRejectedValue(error);
  
      await expect(repository.findAll()).rejects.toThrow('Database query failed');
    });
  });
});