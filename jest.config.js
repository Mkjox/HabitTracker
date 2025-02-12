module.exports = {
    preset: 'react-native',
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest'
    },
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.jest.json'
      }
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
      '\\.svg': '<rootDir>/__mocks__/svgMock.js'
    },
    transformIgnorePatterns: [
      'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|expo-.*|@expo(nent)?/.*|react-navigation|@react-navigation/.*))'
    ],
    setupFiles: ['<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'],
    testEnvironment: 'jsdom'
  };
  