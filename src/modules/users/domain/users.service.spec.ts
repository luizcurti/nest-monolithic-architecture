import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Queue } from 'bull';
import { UsersService } from './users.service';
import { UsersRepository, USERS_REPOSITORY_TOKEN } from './repositories/user.repository.interface';
import { CreateUserDto } from '../http/dtos/create-users.dto';
import { UserCreatedEvent } from '../../../common/events/user-created.event';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: jest.Mocked<UsersRepository>;
  let mockEventEmitter: jest.Mocked<EventEmitter2>;
  let mockQueue: jest.Mocked<Queue>;

  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockEventEmitter = {
      emit: jest.fn(),
    } as any;

    mockQueue = {
      add: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USERS_REPOSITORY_TOKEN,
          useValue: mockRepository,
        },
        {
          provide: 'BullQueue_users',
          useValue: mockQueue,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    })
    .setLogger(mockLogger)
    .compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
    };

    it('should create a user successfully', async () => {
      
      mockRepository.create.mockResolvedValue(mockUser);
      mockEventEmitter.emit.mockReturnValue(true);
      mockQueue.add.mockResolvedValue({} as any);
  
      const result = await service.create(createUserDto);
      
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'user.created',
        expect.any(UserCreatedEvent)
      );
      expect(mockQueue.add).toHaveBeenCalledTimes(2);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'user.created',
        expect.any(UserCreatedEvent)
      );
      expect(mockQueue.add).toHaveBeenCalledWith(
        'user.email.send',
        expect.any(UserCreatedEvent)
      );
      expect(result).toEqual(mockUser);
    });

    it('should emit user created event with correct data', async () => {
      
      mockRepository.create.mockResolvedValue(mockUser);
      mockEventEmitter.emit.mockReturnValue(true);
      mockQueue.add.mockResolvedValue({} as any);
  
      await service.create(createUserDto);
      
      const emittedEvent = mockEventEmitter.emit.mock.calls[0][1] as UserCreatedEvent;
      expect(emittedEvent.name).toBe(createUserDto.name);
      expect(emittedEvent.email).toBe(createUserDto.email);
    });

    it('should handle repository errors', async () => {
      
      const error = new Error('Repository error');
      mockRepository.create.mockRejectedValue(error);
  
      await expect(service.create(createUserDto)).rejects.toThrow('Repository error');
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
      expect(mockQueue.add).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      
      const mockUsers = [mockUser, { ...mockUser, id: 2, name: 'User 2' }];
      mockRepository.findAll.mockResolvedValue(mockUsers);
  
      const result = await service.findAll();
      
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      
      mockRepository.findAll.mockResolvedValue([]);
  
      const result = await service.findAll();
      
      expect(mockRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle repository errors', async () => {
      
      const error = new Error('Database connection failed');
      mockRepository.findAll.mockRejectedValue(error);
  
      await expect(service.findAll()).rejects.toThrow('Database connection failed');
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById(1);

      expect(mockRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findById(99)).rejects.toThrow('User with id 99 not found');
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const updated = { ...mockUser, name: 'New Name' };
      mockRepository.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: 'New Name' });

      expect(mockRepository.update).toHaveBeenCalledWith(1, { name: 'New Name' });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockRepository.update.mockResolvedValue(null);

      await expect(service.update(99, { name: 'Ghost' })).rejects.toThrow('User with id 99 not found');
    });
  });

  describe('delete', () => {
    it('should delete user successfully', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.delete.mockResolvedValue(undefined);

      await expect(service.delete(1)).resolves.toBeUndefined();
      expect(mockRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.delete(99)).rejects.toThrow('User with id 99 not found');
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('welcomeNewUser', () => {
    it('should resolve without errors', async () => {
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = ((fn: any) => { fn(); return {} as any; }) as any;

      await expect(service.welcomeNewUser(new UserCreatedEvent('Test', 'test@example.com'))).resolves.toBeUndefined();

      global.setTimeout = originalSetTimeout;
    });
  });
});