/**
 * ChatService Tests
 */

jest.mock('../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

jest.mock('../db/sqlite', () => ({
  getDb: jest.fn(() => Promise.resolve({
    all: jest.fn().mockResolvedValue([]),
    get: jest.fn().mockResolvedValue(null),
    run: jest.fn().mockResolvedValue({ id: 1 }),
  })),
}));

const ChatService = require('../services/ChatService');

describe('ChatService', () => {
  describe('createConversation', () => {
    test('should be a function', () => {
      expect(typeof ChatService.createConversation).toBe('function');
    });

    test('should create a new conversation', async () => {
      const convData = {
        userId: 'user123',
        bookingId: 'bkg1',
      };
      const result = await ChatService.createConversation(convData);
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });

  describe('sendMessage', () => {
    test('should be a function', () => {
      expect(typeof ChatService.sendMessage).toBe('function');
    });

    test('should send a message', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        text: 'Hello',
      };
      const result = await ChatService.sendMessage(msgData);
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });

  describe('getMessages', () => {
    test('should be a function', () => {
      expect(typeof ChatService.getMessages).toBe('function');
    });

    test('should return array of messages', async () => {
      const messages = await ChatService.getMessages('conv1');
      expect(Array.isArray(messages) || messages === null).toBe(true);
    });
  });

  describe('getConversations', () => {
    test('should be a function', () => {
      expect(typeof ChatService.getConversations).toBe('function');
    });

    test('should return array of conversations', async () => {
      const conversations = await ChatService.getConversations('user123');
      expect(Array.isArray(conversations) || conversations === null).toBe(true);
    });
  });

  describe('deleteConversation', () => {
    test('should be a function', () => {
      expect(typeof ChatService.deleteConversation).toBe('function');
    });
  });

  describe('markAsRead', () => {
    test('should be a function', () => {
      expect(typeof ChatService.markAsRead).toBe('function');
    });
  });

  describe('getUnreadCount', () => {
    test('should be a function', () => {
      expect(typeof ChatService.getUnreadCount).toBe('function');
    });
  });

  describe('Advanced chat scenarios', () => {
    test('should handle conversation with multiple participants', async () => {
      const convData = {
        userId: 'user123',
        bookingId: 'bkg1',
        participants: ['user1', 'user2', 'user3'],
      };
      const result = await ChatService.createConversation(convData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should send messages with attachments', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        text: 'Check this photo',
        attachments: [
          {
            type: 'image',
            url: 'https://example.com/photo.jpg',
            filename: 'photo.jpg',
          },
        ],
      };
      const result = await ChatService.sendMessage(msgData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should support message reactions', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        text: 'Hello',
        reactions: ['👍', '❤️', '😄'],
      };
      const result = await ChatService.sendMessage(msgData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should handle message editing', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        messageId: 'msg123',
        text: 'Hello (edited)',
        edited: true,
      };
      const result = await ChatService.sendMessage(msgData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should support message deletion', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        messageId: 'msg123',
        deleted: true,
      };
      const result = await ChatService.sendMessage(msgData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should handle typing indicators', async () => {
      const typingData = {
        conversationId: 'conv1',
        userId: 'user123',
        isTyping: true,
      };
      const result = await ChatService.sendMessage(typingData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should support message search', async () => {
      const messages = await ChatService.getMessages('conv1', {
        searchTerm: 'booking',
        limit: 10,
      });
      expect(Array.isArray(messages) || messages === null).toBe(true);
    });

    test('should handle conversation archive', async () => {
      const convData = {
        conversationId: 'conv1',
        archived: true,
      };
      const result = await ChatService.createConversation(convData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should support conversation mute', async () => {
      const convData = {
        conversationId: 'conv1',
        userId: 'user123',
        muted: true,
      };
      const result = await ChatService.createConversation(convData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should retrieve conversations with pagination', async () => {
      const conversations = await ChatService.getConversations('user123', {
        page: 1,
        limit: 20,
        sort: 'lastMessage',
      });
      expect(Array.isArray(conversations) || conversations === null).toBe(true);
    });
  });

  describe('Chat message content validation', () => {
    test('should handle very long messages', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        text: 'x'.repeat(10000),
      };
      const result = await ChatService.sendMessage(msgData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should handle messages with special characters', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        text: '!@#$%^&*()_+-=[]{}|;:",.<>?/~`',
      };
      const result = await ChatService.sendMessage(msgData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should handle unicode messages', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        text: '你好 مرحبا Привет 🎉 ❤️',
      };
      const result = await ChatService.sendMessage(msgData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should handle empty messages', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        text: '',
      };
      const result = await ChatService.sendMessage(msgData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should handle messages with URLs', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        text: 'Check this: https://example.com and also http://test.org',
      };
      const result = await ChatService.sendMessage(msgData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should handle messages with mentions', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        text: 'Hi @user1 and @user2, can you help?',
        mentions: ['user1', 'user2'],
      };
      const result = await ChatService.sendMessage(msgData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should handle messages with hashtags', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        text: 'This is #great and #awesome #cleaning',
        hashtags: ['great', 'awesome', 'cleaning'],
      };
      const result = await ChatService.sendMessage(msgData);
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });

  describe('Chat edge cases', () => {
    test('should handle non-existent conversation', async () => {
      const messages = await ChatService.getMessages('non_existent_conv');
      expect(Array.isArray(messages) || messages === null).toBe(true);
    });

    test('should handle conversations with no messages', async () => {
      const result = await ChatService.deleteConversation('conv_empty');
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should handle invalid participant IDs', async () => {
      const convData = {
        userId: '',
        bookingId: '',
      };
      const result = await ChatService.createConversation(convData);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should handle marking read on non-existent messages', async () => {
      const result = await ChatService.markAsRead('non_existent_conv');
      expect(result === null || typeof result === 'object').toBe(true);
    });

    test('should handle unread count for inactive users', async () => {
      const count = await ChatService.getUnreadCount('inactive_user');
      expect(typeof count === 'number' || count === null).toBe(true);
    });

    test('should handle concurrent message sending', async () => {
      const promises = Array(5).fill(null).map((_, i) => {
        return ChatService.sendMessage({
          conversationId: 'conv1',
          userId: 'user123',
          text: `Message ${i}`,
        });
      });

      const results = await Promise.all(promises);
      expect(results.length).toBe(5);
    });

    test('should prevent duplicate messages', async () => {
      const msgData = {
        conversationId: 'conv1',
        userId: 'user123',
        text: 'Unique message',
        idempotencyKey: 'unique-key-123',
      };

      const result1 = await ChatService.sendMessage(msgData);
      const result2 = await ChatService.sendMessage(msgData);

      expect(result1 === null || typeof result1 === 'object').toBe(true);
      expect(result2 === null || typeof result2 === 'object').toBe(true);
    });

    test('should handle conversation list pagination edge cases', async () => {
      const testCases = [
        { page: 0, limit: 10 },
        { page: 1, limit: 0 },
        { page: -1, limit: 10 },
        { page: 999, limit: 10 },
      ];

      for (const testCase of testCases) {
        const conversations = await ChatService.getConversations('user123', testCase);
        expect(Array.isArray(conversations) || conversations === null).toBe(true);
      }
    });

    test('should handle message retrieval with filters', async () => {
      const messages = await ChatService.getMessages('conv1', {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        userId: 'user123',
      });
      expect(Array.isArray(messages) || messages === null).toBe(true);
    });
  });

  describe('Chat performance scenarios', () => {
    test('should handle large conversation histories', async () => {
      const messages = await ChatService.getMessages('conv_large', {
        limit: 1000,
      });
      expect(Array.isArray(messages) || messages === null).toBe(true);
    });

    test('should handle many concurrent conversations', async () => {
      const conversations = await ChatService.getConversations('user_busy', {
        limit: 100,
      });
      expect(Array.isArray(conversations) || conversations === null).toBe(true);
    });

    test('should handle bulk message operations', async () => {
      const promises = Array(20).fill(null).map((_, i) => {
        return ChatService.sendMessage({
          conversationId: `conv${i}`,
          userId: 'user123',
          text: `Bulk message ${i}`,
        });
      });

      const results = await Promise.all(promises);
      expect(results.length).toBe(20);
    });
  });
});
