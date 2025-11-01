import { Request, Response, NextFunction } from 'express';

/**
 * Ethereum address validation middleware
 */
export const validateEthereumAddress = (field: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const address = req.params[field] || req.body[field];
    
    if (!address) {
      res.status(400).json({ error: `${field} is required` });
      return;
    }

    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      res.status(400).json({ error: `Invalid ${field} format. Must be a valid Ethereum address` });
      return;
    }

    next();
  };
};

/**
 * Transaction hash validation middleware
 */
export const validateTransactionHash = (field: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const txHash = req.params[field] || req.body[field];
    
    if (!txHash) {
      res.status(400).json({ error: `${field} is required` });
      return;
    }

    if (!txHash.match(/^0x[a-fA-F0-9]{64}$/)) {
      res.status(400).json({ error: `Invalid ${field} format. Must be a valid transaction hash` });
      return;
    }

    next();
  };
};

/**
 * Amount validation middleware
 */
export const validateAmount = (field: string, options?: { min?: number; max?: number; allowZero?: boolean }) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const amount = req.body[field];
    
    if (amount === undefined || amount === null) {
      res.status(400).json({ error: `${field} is required` });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) {
      res.status(400).json({ error: `${field} must be a valid number` });
      return;
    }

    if (!options?.allowZero && amountNum <= 0) {
      res.status(400).json({ error: `${field} must be greater than zero` });
      return;
    }

    if (options?.min !== undefined && amountNum < options.min) {
      res.status(400).json({ error: `${field} must be at least ${options.min}` });
      return;
    }

    if (options?.max !== undefined && amountNum > options.max) {
      res.status(400).json({ error: `${field} must not exceed ${options.max}` });
      return;
    }

    next();
  };
};

/**
 * Signature validation middleware
 */
export const validateSignature = (field: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const signature = req.body[field];
    
    if (!signature) {
      res.status(400).json({ error: `${field} is required` });
      return;
    }

    if (!signature.match(/^0x[a-fA-F0-9]{130}$/)) {
      res.status(400).json({ error: `Invalid ${field} format. Must be a valid Ethereum signature` });
      return;
    }

    next();
  };
};

/**
 * Message validation middleware
 */
export const validateMessage = (field: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const message = req.body[field];
    
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: `${field} is required and must be a string` });
      return;
    }

    if (message.length > 1000) {
      res.status(400).json({ error: `${field} must not exceed 1000 characters` });
      return;
    }

    next();
  };
};

/**
 * Rate limiting helper
 */
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const record = requests.get(key);

    if (!record || now > record.resetTime) {
      requests.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    record.count++;
    next();
  };
};

/**
 * Error handler middleware
 */
export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Request error:', {
    method: req.method,
    url: req.url,
    error: error.message,
    stack: error.stack
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (error.message.includes('insufficient balance')) {
    return res.status(402).json({ 
      error: 'Insufficient balance',
      details: isDevelopment ? error.message : undefined
    });
  }

  if (error.message.includes('rate limit')) {
    return res.status(429).json({ 
      error: 'Rate limit exceeded',
      details: isDevelopment ? error.message : undefined
    });
  }

  if (error.message.includes('invalid signature')) {
    return res.status(401).json({ 
      error: 'Invalid signature',
      details: isDevelopment ? error.message : undefined
    });
  }

  return res.status(500).json({ 
    error: 'Internal server error',
    details: isDevelopment ? error.message : undefined
  });
};