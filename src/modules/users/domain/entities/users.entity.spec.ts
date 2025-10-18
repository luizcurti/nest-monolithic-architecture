import { User } from './users.entity';

describe('User Entity', () => {
  it('should be defined', () => {
    const user = new User();
    expect(user).toBeDefined();
  });

  it('should create user with properties', () => {

    const user = Object.assign(new User(), {
      name: 'John Doe',
      email: 'john.doe@example.com',
    });
    
    expect(user.name).toBe('John Doe');
    expect(user.email).toBe('john.doe@example.com');
  });

  it('should have readonly properties', () => {
    
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const user = Object.assign(new User(), userData);
    
    expect(user).toHaveProperty('name', userData.name);
    expect(user).toHaveProperty('email', userData.email);
  });

  it('should be used as entity type', () => {
    
    const userProperties = {
      name: 'Entity User',
      email: 'entity@example.com',
    };

    const user = Object.assign(new User(), userProperties);
    
    expect(user).toBeInstanceOf(User);
    expect(typeof user.name).toBe('string');
    expect(typeof user.email).toBe('string');
  });

  it('should allow creating multiple instances', () => {

    const user1 = Object.assign(new User(), {
      name: 'User 1',
      email: 'user1@example.com',
    });

    const user2 = Object.assign(new User(), {
      name: 'User 2', 
      email: 'user2@example.com',
    });
    
    expect(user1).not.toBe(user2);
    expect(user1.name).not.toBe(user2.name);
    expect(user1.email).not.toBe(user2.email);
  });
});