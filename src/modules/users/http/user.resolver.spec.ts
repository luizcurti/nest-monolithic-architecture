import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UsersService } from '../domain/users.service';
import { CreateUserDto } from './dtos/create-users.dto';

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('UserResolver', () => {
  let resolver: UserResolver;
  let mockUsersService: jest.Mocked<UsersService>;

  const mockUser = {
    name: 'Test User',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      welcomeNewUser: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
    .setLogger(mockLogger)
    .compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should have usersService injected', () => {
    expect((resolver as any).usersService).toBeDefined();
    expect((resolver as any).usersService).toBe(mockUsersService);
  });

  it('should be instance of UserResolver', () => {
    expect(resolver).toBeInstanceOf(UserResolver);
  });

  it('should have correct constructor dependencies', () => {
    expect(resolver).toBeDefined();
    expect((resolver as any).usersService).toBe(mockUsersService);
    
    expect(UserResolver).toBeDefined();
    expect(typeof UserResolver).toBe('function');
  });

  describe('findAll', () => {
    it('should log correct function name in findAll', async () => {
      
      mockUsersService.findAll.mockResolvedValue([]);
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
      await resolver.findAll();
      expect(consoleSpy).toHaveBeenCalledWith('Called: ', 'findAll');
      expect(consoleSpy).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });

    it('should call usersService.findAll exactly once', async () => {
      
      mockUsersService.findAll.mockResolvedValue([]);
      jest.spyOn(console, 'info').mockImplementation();
  
      await resolver.findAll();
      
      expect(mockUsersService.findAll).toHaveBeenCalledTimes(1);
      expect(mockUsersService.findAll).toHaveBeenCalledWith();
    });

    it('should return empty array when no users exist', async () => {
      
      mockUsersService.findAll.mockResolvedValue([]);
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
  
      const result = await resolver.findAll();
      
      expect(consoleSpy).toHaveBeenCalledWith('Called: ', 'findAll');
      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });

    it('should handle service errors', async () => {
      
      const error = new Error('Service error');
      mockUsersService.findAll.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
  
      await expect(resolver.findAll()).rejects.toThrow('Service error');
      expect(consoleSpy).toHaveBeenCalledWith('Called: ', 'findAll');

      consoleSpy.mockRestore();
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
    };

    it('should log createUserDto object in create method', async () => {
      
      mockUsersService.create.mockResolvedValue(mockUser);
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();
  
      await resolver.create(createUserDto);

      expect(consoleSpy).toHaveBeenCalledWith(createUserDto);
      expect(consoleSpy).toHaveBeenCalledTimes(1);

      consoleSpy.mockRestore();
    });

    it('should call usersService.create with correct arguments', async () => {
      
      mockUsersService.create.mockResolvedValue(mockUser);
      jest.spyOn(console, 'info').mockImplementation();

      await resolver.create(createUserDto);
      
      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle service errors', async () => {
      
      const error = new Error('Service error');
      mockUsersService.create.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'info').mockImplementation();

      await expect(resolver.create(createUserDto)).rejects.toThrow('Service error');
      expect(consoleSpy).toHaveBeenCalledWith(createUserDto);

      consoleSpy.mockRestore();
    });
  });
});