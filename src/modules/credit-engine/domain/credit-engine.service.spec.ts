import { Test, TestingModule } from '@nestjs/testing';
import { CreditService } from './credit-engine.service';

describe('CreditService', () => {
  let service: CreditService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditService],
    }).compile();

    service = module.get<CreditService>(CreditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return credit engine message', () => {
  
      const result = service.findAll();

      
      expect(result).toBe('Hello Credit Engine');
    });

    it('should always return the same message', () => {
  
      const result1 = service.findAll();
      const result2 = service.findAll();

      
      expect(result1).toBe(result2);
      expect(result1).toBe('Hello Credit Engine');
    });
  });
});