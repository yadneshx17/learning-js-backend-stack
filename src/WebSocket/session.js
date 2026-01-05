let activeSession = null

export const getActiveSession = () => activeSession;

export const startActiveSession = (classId) => {
  activeSession = {
    classId,
    startedAt: new Date().toISOString(),
    attendance: {}
  };
  return activeSession;
}

export const clearActiveSesson = () => activeSession = null;