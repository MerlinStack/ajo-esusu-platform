import { useCallback, useRef, useState } from 'react';
import useAppStore from '../store/useAppStore';

const useDataEngine = () => {
  const store = useAppStore;
  const processingRef = useRef(false);
  const [engineState, setEngineState] = useState({
    isProcessing: false,
    lastOperation: null,
    error: null,
  });

  const wrapAsync = useCallback(async (operation, operationName) => {
    setEngineState({ isProcessing: true, lastOperation: operationName, error: null });
    try {
      const result = await operation();
      setEngineState({ isProcessing: false, lastOperation: operationName, error: null });
      return result;
    } catch (err) {
      const errorMsg = err.message || 'An unexpected error occurred.';
      setEngineState({ isProcessing: false, lastOperation: operationName, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const login = useCallback(
    (email, password) => wrapAsync(() => store.getState().login(email, password), 'login'),
    [wrapAsync]
  );

  const register = useCallback(
    (userData) => wrapAsync(() => store.getState().register(userData), 'register'),
    [wrapAsync]
  );

  const logout = useCallback(() => {
    store.getState().logout();
    setEngineState({ isProcessing: false, lastOperation: 'logout', error: null });
  }, []);

  const createCircle = useCallback(
    (circleData) => wrapAsync(() => store.getState().createCircle(circleData), 'createCircle'),
    [wrapAsync]
  );

  const joinCircle = useCallback(
    (circleId) => wrapAsync(() => store.getState().joinCircle(circleId), 'joinCircle'),
    [wrapAsync]
  );

  const leaveCircle = useCallback(
    (circleId) => wrapAsync(() => store.getState().leaveCircle(circleId), 'leaveCircle'),
    [wrapAsync]
  );

  const recordContribution = useCallback(
    (circleId) => wrapAsync(() => store.getState().recordContribution(circleId), 'recordContribution'),
    [wrapAsync]
  );

  const recordAdminPayout = useCallback(
    (circleId, memberUserId, amount) =>
      wrapAsync(() => store.getState().recordAdminPayout(circleId, memberUserId, amount), 'recordAdminPayout'),
    [wrapAsync]
  );

  const sendSystemNotification = useCallback(
    (title, message, targetUserId) =>
      wrapAsync(() => store.getState().sendSystemNotification(title, message, targetUserId), 'sendSystemNotification'),
    [wrapAsync]
  );

  const deleteCircle = useCallback(
    (circleId) => wrapAsync(() => store.getState().deleteCircle(circleId), 'deleteCircle'),
    [wrapAsync]
  );

  const verifyTransaction = useCallback(
    (txId) => wrapAsync(() => store.getState().verifyTransaction(txId), 'verifyTransaction'),
    [wrapAsync]
  );

  const calculateCreditRiskScore = useCallback(
    (userId) => {
      const state = store.getState();
      const userTx = state.transactions.filter((tx) => tx.userId === userId);
      if (userTx.length === 0) return { score: 0, level: 'unrated', factors: [], totalContributions: 0, totalPayouts: 0, contributionCount: 0, payoutCount: 0 };
      const totalContributions = userTx.filter((tx) => tx.type === 'contribution').reduce((s, tx) => s + tx.amount, 0);
      const totalPayouts = userTx.filter((tx) => tx.type === 'payout').reduce((s, tx) => s + tx.amount, 0);
      const contributionCount = userTx.filter((tx) => tx.type === 'contribution').length;
      const payoutCount = userTx.filter((tx) => tx.type === 'payout').length;
      const consistencyRatio = contributionCount > 0 ? Math.min(1, payoutCount / Math.max(contributionCount, 1)) : 0;
      const volumeScore = Math.min(1, totalContributions / 500000);
      const savingsRetention = totalContributions > 0 ? Math.min(1, (totalContributions - totalPayouts) / totalContributions) : 0;
      const rawScore = consistencyRatio * 0.4 + volumeScore * 0.3 + savingsRetention * 0.3;
      const score = Math.round(rawScore * 100);
      let level = 'low';
      if (score >= 80) level = 'excellent';
      else if (score >= 60) level = 'good';
      else if (score >= 40) level = 'fair';
      const factors = [
        { name: 'Payment Consistency', weight: 0.4, value: consistencyRatio, score: Math.round(consistencyRatio * 40) },
        { name: 'Savings Volume', weight: 0.3, value: volumeScore, score: Math.round(volumeScore * 30) },
        { name: 'Savings Retention', weight: 0.3, value: savingsRetention, score: Math.round(savingsRetention * 30) },
      ];
      return { score, level, factors, totalContributions, totalPayouts, contributionCount, payoutCount };
    },
    []
  );

  const calculateCyclePayoutSchedule = useCallback(
    (circleId) => {
      const state = store.getState();
      const circle = state.circles.find((c) => c.id === circleId);
      if (!circle) return null;
      const members = state.circleMembers.filter((m) => m.circleId === circleId).sort((a, b) => a.payoutOrder - b.payoutOrder);
      const totalPerCycle = circle.contributionAmount * members.length;
      const allUsers = members.map((m) => ({ ...m, user: state.users.find((u) => u.id === m.userId) }));
      const schedule = allUsers.map((m, idx) => ({
        position: idx + 1,
        memberName: m.user?.name || 'Unknown',
        memberId: m.userId,
        expectedAmount: totalPerCycle,
        cycleIndex: idx,
        estimatedDate: new Date(Date.now() + idx * (circle.frequency === 'Daily' ? 86400000 : circle.frequency === 'Weekly' ? 604800000 : circle.frequency === 'Monthly' ? 2592000000 : 1209600000)).toISOString(),
      }));
      return { totalPerCycle, schedule, memberCount: members.length };
    },
    []
  );

  const calculateDoubleEntryBalance = useCallback(
    (circleId) => {
      const state = store.getState();
      const contributions = state.transactions.filter((tx) => tx.circleId === circleId && tx.type === 'contribution' && tx.status === 'verified');
      const payouts = state.transactions.filter((tx) => tx.circleId === circleId && tx.type === 'payout' && tx.status === 'verified');
      const totalDebit = contributions.reduce((s, tx) => s + tx.amount, 0);
      const totalCredit = payouts.reduce((s, tx) => s + tx.amount, 0);
      const netBalance = totalDebit - totalCredit;
      const entries = [
        { account: 'Contributions Receivable', type: 'debit', total: totalDebit, count: contributions.length },
        { account: 'Payouts Payable', type: 'credit', total: totalCredit, count: payouts.length },
        { account: 'Net Pool Balance', type: netBalance >= 0 ? 'debit' : 'credit', total: Math.abs(netBalance), count: 1 },
      ];
      return { totalDebit, totalCredit, netBalance, verified: netBalance === 0, entries };
    },
    []
  );

  const executeCyclePayoutCheck = useCallback(() => {
    const state = store.getState();
    state.circles.filter((c) => c.status === 'active').forEach((circle) => {
      state.evaluateCyclePayout(circle.id);
    });
  }, []);

  const computePlatformMetrics = useCallback(() => {
    const state = store.getState();
    const totalContributions = state.transactions.filter((tx) => tx.type === 'contribution' && tx.status === 'verified').reduce((s, tx) => s + tx.amount, 0);
    const totalPayouts = state.transactions.filter((tx) => tx.type === 'payout' && tx.status === 'verified').reduce((s, tx) => s + tx.amount, 0);
    const pendingTx = state.transactions.filter((tx) => tx.status === 'pending').length;
    const activeCircles = state.circles.filter((c) => c.status === 'active').length;
    const totalMembers = new Set(state.circleMembers.map((m) => m.userId)).size;
    const payoutEvents = state.transactions.filter((tx) => tx.type === 'payout').length;
    const avgContribution = totalContributions > 0
      ? Math.round(totalContributions / state.transactions.filter((tx) => tx.type === 'contribution').length) : 0;
    return {
      totalContributions, totalPayouts, netPoolValue: totalContributions - totalPayouts,
      pendingTransactions: pendingTx, activeCircles, totalMembers, payoutEvents,
      averageContribution: avgContribution,
      ledgerIntegrity: pendingTx === 0 ? 100 : Math.round((1 - pendingTx / Math.max(state.transactions.length, 1)) * 100),
    };
  }, []);

  const triggerManualCycleCheck = useCallback(() => {
    if (processingRef.current) return { success: false, reason: 'Already processing.' };
    processingRef.current = true;
    setEngineState({ isProcessing: true, lastOperation: 'manualCycleCheck', error: null });
    try {
      executeCyclePayoutCheck();
      const metrics = computePlatformMetrics();
      processingRef.current = false;
      setEngineState({ isProcessing: false, lastOperation: 'manualCycleCheck', error: null });
      return { success: true, metrics };
    } catch (err) {
      processingRef.current = false;
      setEngineState({ isProcessing: false, lastOperation: 'manualCycleCheck', error: err.message });
      return { success: false, error: err.message };
    }
  }, [executeCyclePayoutCheck, computePlatformMetrics]);

  const getRoleFilteredData = useCallback(() => {
    const state = store.getState();
    const currentUser = state.auth.currentUser;
    const activeRole = state.auth.activeRole;

    if (!currentUser) {
      return { users: [], circles: [], circleMembers: [], transactions: [], notifications: [], auditLogs: [] };
    }

    if (activeRole === 'Admin') {
      return {
        users: state.users,
        circles: state.circles,
        circleMembers: state.circleMembers,
        transactions: state.transactions,
        notifications: state.notifications,
        auditLogs: state.auditLogs,
      };
    }

    const myCircleIds = new Set(
      state.circleMembers.filter((m) => m.userId === currentUser.id).map((m) => m.circleId)
    );
    const myCircles = state.circles.filter((c) => myCircleIds.has(c.id));
    const myCircleIdsSet = new Set(myCircles.map((c) => c.id));
    const myTransactions = state.transactions.filter(
      (tx) => tx.userId === currentUser.id || myCircleIdsSet.has(tx.circleId)
    );
    const myNotifications = state.notifications.filter(
      (n) => n.userId === currentUser.id || n.userId === null
    );

    return {
      users: [currentUser],
      circles: myCircles,
      circleMembers: state.circleMembers.filter((m) => myCircleIdsSet.has(m.circleId)),
      transactions: myTransactions,
      notifications: myNotifications,
      auditLogs: [],
    };
  }, []);

  const getEmptyStateMessage = useCallback((entityType) => {
    const messages = {
      circles: 'No savings circles exist yet. Create one to get started.',
      transactions: 'No transactions recorded yet. Contributions will appear here.',
      notifications: 'No notifications at this time.',
      members: 'No members in this circle yet.',
      auditLogs: 'No audit log entries recorded yet.',
      contributions: 'No contributions recorded for this cycle.',
    };
    return messages[entityType] || 'No data available.';
  }, []);

  return {
    engineState,
    login,
    register,
    logout,
    createCircle,
    joinCircle,
    leaveCircle,
    recordContribution,
    recordAdminPayout,
    sendSystemNotification,
    deleteCircle,
    verifyTransaction,
    calculateCreditRiskScore,
    calculateCyclePayoutSchedule,
    calculateDoubleEntryBalance,
    executeCyclePayoutCheck,
    computePlatformMetrics,
    triggerManualCycleCheck,
    getRoleFilteredData,
    getEmptyStateMessage,
    wrapAsync,
  };
};

export default useDataEngine;
