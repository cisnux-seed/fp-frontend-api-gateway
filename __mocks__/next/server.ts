export const NextResponse = {
  json: jest.fn(() => ({
    headers: {
      set: jest.fn(),
    },
  })),
};
