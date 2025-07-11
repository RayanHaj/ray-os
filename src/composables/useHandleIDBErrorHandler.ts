export function useHandleIDBErrorHandler(error: Error) {
  switch (error.name) {
    case 'ConstraintError': {
      console.error('ConstraintError');
    } break;
    default: {
      console.error(error.message);
    }
  }
}
