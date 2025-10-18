import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from '../domain/users.service';
import { CreateUserDto } from './dtos/create-users.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: jest.Mocked<UsersService>;

  const mockUser = {
    id: 1,
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
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
    };

    it('should create a user successfully', async () => {
      
      mockUsersService.create.mockResolvedValue(mockUser);

  
      const result = await controller.create(createUserDto);

      
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });

    it('should handle service errors', async () => {
      
      const error = new Error('Service error');
      mockUsersService.create.mockRejectedValue(error);

  
      await expect(controller.create(createUserDto)).rejects.toThrow('Service error');
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      
      const mockUsers = [mockUser, { ...mockUser, id: 2, name: 'User 2' }];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

  
      const result = await controller.findAll();

      
      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array when no users exist', async () => {
      
      mockUsersService.findAll.mockResolvedValue([]);

  
      const result = await controller.findAll();

      
      expect(mockUsersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should handle service errors', async () => {
      
      const error = new Error('Service error');
      mockUsersService.findAll.mockRejectedValue(error);

  
      await expect(controller.findAll()).rejects.toThrow('Service error');
    });
  });
});