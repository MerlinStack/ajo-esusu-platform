import React, { useState, useMemo } from 'react';
import {
  Grid, Card, CardContent, Typography, Box,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Tooltip, Stack, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, IconButton,
  Avatar, AvatarGroup, LinearProgress, Divider, Tab, Tabs,
} from '@mui/material';
import {
  ShieldCheck, Users, FileSpreadsheet, CheckCircle2,
  Wallet, Crown, Activity, Database, Bell,
  UserCheck, RefreshCw, X, Search, CircleDot,
  Clock, TrendingUp, Trash2, Send, ListChecks, BarChart3,
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import useDataEngine from '../hooks/useDataEngine';

const AdminTerminal = () => {
  const auth = useAppStore((s) => s.auth);
  const users = useAppStore((s) => s.users);
  const circles = useAppStore((s) => s.circles);
  const circleMembers = useAppStore((s) => s.circleMembers);
  const transactions = useAppStore((s) => s.transactions);
  const notifications = useAppStore((s) => s.notifications);
  const auditLogs = useAppStore((s) => s.auditLogs);
  const getTelemetryData = useAppStore((s) => s.getTelemetryData);
  const verifyTransaction = useAppStore((s) => s.verifyTransaction);
  const deleteCircle = useAppStore((s) => s.deleteCircle);
  const recordAdminPayout = useAppStore((s) => s.recordAdminPayout);
  const sendSystemNotification = useAppStore((s) => s.sendSystemNotification);
  const evaluateCyclePayout = useAppStore((s) => s.evaluateCyclePayout);

  const { calculateDoubleEntryBalance, computePlatformMetrics, getEmptyStateMessage, triggerManualCycleCheck } = useDataEngine();

  const telemetry = getTelemetryData();
  const metrics = computePlatformMetrics();
  const currentUser = auth.currentUser;

  const [activeTab, setActiveTab] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [notifData, setNotifData] = useState({ title: '', message: '', targetUserId: '' });
  const [payoutData, setPayoutData] = useState({ circleId: '', memberUserId: '', amount: 0 });
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [deleteCircleId, setDeleteCircleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifDialogOpen, setNotifDialogOpen] = useState(false);
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
  }, [users, searchQuery]);

  const pendingTransactions = transactions.filter((tx) => tx.status === 'pending');

  const userStats = (userId) => {
    const userTx = transactions.filter((tx) => tx.userId === userId);
    return {
      totalTx: userTx.length,
      totalContribs: userTx.filter((tx) => tx.type === 'contribution').reduce((s, tx) => s + tx.amount, 0),
      totalPayouts: userTx.filter((tx) => tx.type === 'payout').reduce((s, tx) => s + tx.amount, 0),
      memberCircles: circleMembers.filter((m) => m.userId === userId).length,
    };
  };

  const circleStats = (circleId) => {
    const circleTx = transactions.filter((tx) => tx.circleId === circleId);
    return {
      txCount: circleTx.length,
      totalContribs: circleTx.filter((tx) => tx.type === 'contribution').reduce((s, tx) => s + tx.amount, 0),
      totalPayouts: circleTx.filter((tx) => tx.type === 'payout').reduce((s, tx) => s + tx.amount, 0),
      members: circleMembers.filter((m) => m.circleId === circleId).length,
    };
  };

  const handleSendNotification = async () => {
    if (!notifData.title || !notifData.message) { setActionError('Title and message are required.'); return; }
    setActionLoading(true); setActionError(null);
    const result = await sendSystemNotification(notifData.title, notifData.message, notifData.targetUserId || null);
    setActionLoading(false);
    if (result.success) { setActionSuccess('Notification sent!'); setNotifDialogOpen(false); setNotifData({ title: '', message: '', targetUserId: '' }); }
    else setActionError(result.error || 'Failed.');
  };

  const handleAdminPayout = async () => {
    if (!payoutData.circleId || !payoutData.memberUserId || payoutData.amount <= 0) { setActionError('All fields required.'); return; }
    setActionLoading(true); setActionError(null);
    const result = await recordAdminPayout(payoutData.circleId, payoutData.memberUserId, payoutData.amount);
    setActionLoading(false);
    if (result.success) { setActionSuccess('Payout processed!'); setPayoutDialogOpen(false); setPayoutData({ circleId: '', memberUserId: '', amount: 0 }); }
    else setActionError(result.error || 'Failed.');
  };

  const handleVerifyTransaction = async () => {
    if (!selectedTxId) return;
    setActionLoading(true); setActionError(null);
    const result = await verifyTransaction(selectedTxId);
    setActionLoading(false);
    if (result.success) { setActionSuccess('Transaction verified!'); setVerifyDialogOpen(false); setSelectedTxId(null); }
    else setActionError(result.error || 'Failed.');
  };

  const handleDeleteCircle = async () => {
    if (!deleteCircleId) return;
    setActionLoading(true); setActionError(null);
    const result = await deleteCircle(deleteCircleId);
    setActionLoading(false);
    if (result.success) { setActionSuccess('Circle deleted.'); setDeleteConfirmOpen(false); setDeleteCircleId(null); }
    else setActionError(result.error || 'Failed.');
  };

  const handleManualCheck = () => {
    const result = triggerManualCycleCheck();
    if (result.success) setActionSuccess('Cycle check completed.');
    else setActionError(result.error || 'Check failed.');
  };

  return (
    <Box>
      {actionSuccess && (
        <Alert severity="success" sx={{ mb: 2, fontFamily: "'JetBrains Mono', monospace" }}
          action={<IconButton size="small" onClick={() => setActionSuccess(null)}><X size={14} /></IconButton>}>
          {actionSuccess}
        </Alert>
      )}
      {actionError && (
        <Alert severity="error" sx={{ mb: 2, fontFamily: "'JetBrains Mono', monospace" }}
          action={<IconButton size="small" onClick={() => setActionError(null)}><X size={14} /></IconButton>}>
          {actionError}
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShieldCheck size={28} /> System Oversight Terminal
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<RefreshCw size={16} />} onClick={handleManualCheck}
            sx={{ fontFamily: "'JetBrains Mono', monospace" }}>Force Cycle Check</Button>
          <Button variant="contained" size="small" startIcon={<Bell size={16} />}
            onClick={() => setNotifDialogOpen(true)} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>Broadcast Alert</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}><Card sx={{ borderLeft: '4px solid', borderColor: 'primary.main' }}><CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}><Typography variant="caption" color="text.secondary">Total Users</Typography><Typography variant="h5" sx={{ fontWeight: 700 }}>{users.length}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={2.4}><Card sx={{ borderLeft: '4px solid', borderColor: 'success.main' }}><CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}><Typography variant="caption" color="text.secondary">Active Circles</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: 'success.main' }}>{circles.filter((c) => c.status === 'active').length}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={2.4}><Card sx={{ borderLeft: '4px solid', borderColor: 'info.main' }}><CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}><Typography variant="caption" color="text.secondary">Pool Value</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>{metrics.netPoolValue.toLocaleString()}</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={2.4}><Card sx={{ borderLeft: '4px solid', borderColor: 'secondary.main' }}><CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}><Typography variant="caption" color="text.secondary">Integrity</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: 'secondary.main' }}>{telemetry.ledgerIntegrity}%</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={2.4}><Card sx={{ borderLeft: '4px solid', borderColor: 'warning.main' }}><CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}><Typography variant="caption" color="text.secondary">Payout Events</Typography><Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>{metrics.payoutEvents}</Typography></CardContent></Card></Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ px: 2, pt: 1, '& .MuiTab-root': { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: 'none', minHeight: 48 } }}>
          <Tab label="User Registry" icon={<Users size={16} />} iconPosition="start" />
          <Tab label="Circles" icon={<CircleDot size={16} />} iconPosition="start" />
          <Tab label="Ledger & Audit" icon={<FileSpreadsheet size={16} />} iconPosition="start" />
          <Tab label="Overrides" icon={<ShieldCheck size={16} />} iconPosition="start" />
          <Tab label="Audit Trail" icon={<ListChecks size={16} />} iconPosition="start" />
        </Tabs>
      </Paper>

      {activeTab === 0 && (
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Users size={20} /><Typography variant="h6" sx={{ fontWeight: 600 }}>User Registry</Typography>
                <Chip label={`${users.length} Total`} size="small" color="primary" sx={{ fontFamily: "'JetBrains Mono', monospace" }} />
              </Stack>
              <TextField size="small" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{ startAdornment: <Search size={16} style={{ marginRight: 8, opacity: 0.5 }} />, sx: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' } }} sx={{ minWidth: 240 }} />
            </Stack>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 480 }}>
              <Table size="small" stickyHeader>
                <TableHead><TableRow>
                  <TableCell>User</TableCell><TableCell>Email</TableCell><TableCell>Phone</TableCell><TableCell>Role</TableCell>
                  <TableCell align="center">Circles</TableCell><TableCell align="right">Saved</TableCell><TableCell align="right">Payouts</TableCell><TableCell>Joined</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {filteredUsers.length === 0 && (
                    <TableRow><TableCell colSpan={8} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>No users found.</Typography></TableCell></TableRow>
                  )}
                  {filteredUsers.map((user) => {
                    const stats = userStats(user.id);
                    return (
                      <TableRow key={user.id} hover>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: user.role === 'Admin' ? '#ff8f00' : '#00695c', fontSize: '0.65rem', fontWeight: 700 }}>
                              {user.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{user.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: 'text.secondary' }}>{user.email}</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{user.phone}</Typography></TableCell>
                        <TableCell>
                          <Chip label={user.role} size="small" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, bgcolor: user.role === 'Admin' ? 'rgba(255,143,0,0.15)' : 'rgba(0,105,92,0.15)', color: user.role === 'Admin' ? '#ff8f00' : '#00695c' }} />
                        </TableCell>
                        <TableCell align="center"><Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{stats.memberCircles}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'success.main' }}>{stats.totalContribs.toLocaleString()}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'info.main' }}>{stats.totalPayouts.toLocaleString()}</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: 'text.secondary' }}>{formatTime(user.createdAt)}</Typography></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CircleDot size={20} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Circle Management</Typography>
              <Chip label={`${circles.length} Circles`} size="small" color="primary" sx={{ fontFamily: "'JetBrains Mono', monospace" }} />
            </Stack>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 480 }}>
              <Table size="small" stickyHeader>
                <TableHead><TableRow>
                  <TableCell>Circle</TableCell><TableCell>Frequency</TableCell><TableCell>Contribution</TableCell>
                  <TableCell align="center">Members</TableCell><TableCell>Status</TableCell>
                  <TableCell align="right">Pool</TableCell><TableCell align="right">Payouts</TableCell>
                  <TableCell align="center">Cycle</TableCell><TableCell align="center">Actions</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {circles.length === 0 && (
                    <TableRow><TableCell colSpan={9} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>{getEmptyStateMessage('circles')}</Typography></TableCell></TableRow>
                  )}
                  {circles.map((circle) => {
                    const stats = circleStats(circle.id);
                    const members = circleMembers.filter((m) => m.circleId === circle.id);
                    return (
                      <TableRow key={circle.id} hover>
                        <TableCell><Typography variant="body2" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{circle.name}</Typography></TableCell>
                        <TableCell><Chip icon={<Clock size={12} />} label={circle.frequency} size="small" variant="outlined" sx={{ fontFamily: "'JetBrains Mono', monospace" }} /></TableCell>
                        <TableCell><Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{circle.contributionAmount.toLocaleString()}</Typography></TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                            <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.6rem' } }}>
                              {members.map((m) => {
                                const u = users.find((usr) => usr.id === m.userId);
                                return <Tooltip key={m.id} title={u?.name || 'Unknown'}><Avatar sx={{ bgcolor: '#00695c', width: 24, height: 24, fontSize: '0.6rem' }}>{u?.name?.charAt(0) || '?'}</Avatar></Tooltip>;
                              })}
                            </AvatarGroup>
                            <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", ml: 0.5 }}>{members.length}/{circle.maxMembers}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell><Chip label={circle.status} size="small" color={circle.status === 'active' ? 'success' : circle.status === 'completed' ? 'info' : 'warning'} sx={{ fontFamily: "'JetBrains Mono', monospace" }} /></TableCell>
                        <TableCell align="right"><Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'success.main' }}>{stats.totalContribs.toLocaleString()}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'info.main' }}>{stats.totalPayouts.toLocaleString()}</Typography></TableCell>
                        <TableCell align="center"><Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{circle.currentCycleIndex + 1}/{circleMembers.filter((m) => m.circleId === circle.id).length}</Typography></TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title="Delete Circle"><IconButton size="small" color="error" onClick={() => { setDeleteCircleId(circle.id); setDeleteConfirmOpen(true); }}><Trash2 size={16} /></IconButton></Tooltip>
                            <Tooltip title="Evaluate Payout"><IconButton size="small" color="primary" onClick={() => evaluateCyclePayout(circle.id)}><RefreshCw size={16} /></IconButton></Tooltip>
                            <Tooltip title="Admin Payout"><IconButton size="small" color="secondary" onClick={() => { setPayoutData({ circleId: circle.id, memberUserId: members[0]?.userId || '', amount: stats.totalContribs }); setPayoutDialogOpen(true); }}><Crown size={16} /></IconButton></Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <FileSpreadsheet size={20} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Global Transaction Ledger</Typography>
                  <Chip icon={<CheckCircle2 size={14} />} label={`${transactions.length} Records`} size="small" color="success" sx={{ fontFamily: "'JetBrains Mono', monospace" }} />
                  {pendingTransactions.length > 0 && (
                    <Chip icon={<Activity size={14} />} label={`${pendingTransactions.length} Pending`} size="small" color="warning" sx={{ fontFamily: "'JetBrains Mono', monospace" }} />
                  )}
                </Stack>
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 480 }}>
                  <Table size="small" stickyHeader>
                    <TableHead><TableRow>
                      <TableCell>TX ID</TableCell><TableCell>Circle</TableCell><TableCell>Member</TableCell>
                      <TableCell>Type</TableCell><TableCell align="right">Amount</TableCell><TableCell>Timestamp</TableCell>
                      <TableCell>Status</TableCell><TableCell>Verified By</TableCell><TableCell align="center">Actions</TableCell>
                    </TableRow></TableHead>
                    <TableBody>
                      {transactions.length === 0 && (
                        <TableRow><TableCell colSpan={9} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>{getEmptyStateMessage('transactions')}</Typography></TableCell></TableRow>
                      )}
                      {[...transactions].reverse().map((tx) => {
                        const circle = circles.find((c) => c.id === tx.circleId);
                        const memberUser = users.find((u) => u.id === tx.userId);
                        const verifier = tx.verifiedBy ? users.find((u) => u.id === tx.verifiedBy) : null;
                        return (
                          <TableRow key={tx.id} hover>
                            <TableCell><Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'text.secondary' }}>{tx.id}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{circle ? circle.name : tx.circleId}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{memberUser?.name || tx.userId}</Typography></TableCell>
                            <TableCell><Chip icon={tx.type === 'contribution' ? <Wallet size={12} /> : <Crown size={12} />} label={tx.type} size="small" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, bgcolor: tx.type === 'contribution' ? 'rgba(46,125,50,0.12)' : 'rgba(21,101,192,0.12)', color: tx.type === 'contribution' ? '#2e7d32' : '#1565c0' }} /></TableCell>
                            <TableCell align="right"><Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: tx.type === 'contribution' ? '#2e7d32' : '#1565c0' }}>{tx.amount.toLocaleString()}</Typography></TableCell>
                            <TableCell><Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: 'text.secondary' }}>{formatTime(tx.timestamp)}</Typography></TableCell>
                            <TableCell><Chip label={tx.status} size="small" color={tx.status === 'verified' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'} variant="outlined" sx={{ fontFamily: "'JetBrains Mono', monospace" }} /></TableCell>
                            <TableCell><Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: 'text.secondary' }}>{verifier?.name || tx.verifiedBy || '-'}</Typography></TableCell>
                            <TableCell align="center">
                              {tx.status === 'pending' ? (
                                <Button size="small" variant="outlined" color="success" onClick={() => { setSelectedTxId(tx.id); setVerifyDialogOpen(true); }} sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}>Verify</Button>
                              ) : <CheckCircle2 size={16} color="#2e7d32" />}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <BarChart3 size={20} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Double-Entry Balance Check</Typography>
                </Stack>
                {circles.map((circle) => {
                  const balance = calculateDoubleEntryBalance(circle.id);
                  return (
                    <Paper key={circle.id} variant="outlined" sx={{ p: 2, mb: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "'Inter', sans-serif", mb: 1 }}>{circle.name}</Typography>
                      {balance.entries.map((entry) => (
                        <Stack key={entry.account} direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">{entry.account}</Typography>
                          <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{entry.type === 'debit' ? '+' : '-'}{entry.total.toLocaleString()}</Typography>
                        </Stack>
                      ))}
                      <Divider sx={{ my: 1 }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>Net Balance</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: balance.verified ? 'success.main' : 'warning.main' }}>{balance.netBalance.toLocaleString()}</Typography>
                          <Chip label={balance.verified ? 'Balanced' : 'Unbalanced'} size="small" color={balance.verified ? 'success' : 'warning'} sx={{ fontFamily: "'JetBrains Mono', monospace" }} />
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
                {circles.length === 0 && <Typography variant="body2" color="text.secondary">No circles to audit.</Typography>}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <TrendingUp size={20} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Platform Analytics</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid item xs={6}><Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Total Contributions</Typography><Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'success.main' }}>{metrics.totalContributions.toLocaleString()}</Typography></Paper></Grid>
                  <Grid item xs={6}><Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Total Payouts</Typography><Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'info.main' }}>{metrics.totalPayouts.toLocaleString()}</Typography></Paper></Grid>
                  <Grid item xs={6}><Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Net Pool</Typography><Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'primary.main' }}>{metrics.netPoolValue.toLocaleString()}</Typography></Paper></Grid>
                  <Grid item xs={6}><Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Avg Contribution</Typography><Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'secondary.main' }}>{metrics.averageContribution.toLocaleString()}</Typography></Paper></Grid>
                  <Grid item xs={4}><Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Active Circles</Typography><Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{metrics.activeCircles}</Typography></Paper></Grid>
                  <Grid item xs={4}><Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Total Members</Typography><Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{metrics.totalMembers}</Typography></Paper></Grid>
                  <Grid item xs={4}><Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center' }}><Typography variant="caption" color="text.secondary">Payout Events</Typography><Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>{metrics.payoutEvents}</Typography></Paper></Grid>
                </Grid>
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">Ledger Integrity</Typography>
                    <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{metrics.ledgerIntegrity}%</Typography>
                  </Stack>
                  <LinearProgress variant="determinate" value={metrics.ledgerIntegrity} sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: metrics.ledgerIntegrity >= 90 ? '#2e7d32' : metrics.ledgerIntegrity >= 70 ? '#ff8f00' : '#d32f2f' } }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Bell size={20} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Broadcast Alert System</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Send system-wide notifications or target specific users.</Typography>
                <Stack spacing={2}>
                  <TextField label="Title" value={notifData.title} onChange={(e) => setNotifData({ ...notifData, title: e.target.value })} size="small" fullWidth />
                  <TextField label="Message" value={notifData.message} onChange={(e) => setNotifData({ ...notifData, message: e.target.value })} size="small" fullWidth multiline rows={3} />
                  <TextField select label="Target (optional)" value={notifData.targetUserId} onChange={(e) => setNotifData({ ...notifData, targetUserId: e.target.value })} size="small" fullWidth>
                    <MenuItem value="">All Users</MenuItem>
                    {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.name} ({u.role})</MenuItem>)}
                  </TextField>
                  <Button variant="contained" startIcon={<Send size={16} />} onClick={handleSendNotification} disabled={actionLoading || !notifData.title || !notifData.message} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {actionLoading ? 'Sending...' : 'Send Alert'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Crown size={20} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Admin Payout Override</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Manually process a payout to any member (admin privilege).</Typography>
                <Stack spacing={2}>
                  <TextField select label="Circle" value={payoutData.circleId} onChange={(e) => {
                    const cId = e.target.value;
                    const c = circles.find((cir) => cir.id === cId);
                    const members = circleMembers.filter((m) => m.circleId === cId);
                    setPayoutData({ ...payoutData, circleId: cId, memberUserId: members[0]?.userId || '', amount: c ? c.contributionAmount * Math.max(members.length, 1) : 0 });
                  }} size="small" fullWidth>
                    {circles.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </TextField>
                  <TextField select label="Recipient" value={payoutData.memberUserId} onChange={(e) => setPayoutData({ ...payoutData, memberUserId: e.target.value })} size="small" fullWidth>
                    {payoutData.circleId && circleMembers.filter((m) => m.circleId === payoutData.circleId).map((m) => {
                      const u = users.find((us) => us.id === m.userId);
                      return <MenuItem key={m.id} value={m.userId}>{u?.name || 'Unknown'} (Position #{m.payoutOrder + 1})</MenuItem>;
                    })}
                  </TextField>
                  <TextField label="Amount" type="number" value={payoutData.amount} onChange={(e) => setPayoutData({ ...payoutData, amount: parseInt(e.target.value) || 0 })} size="small" fullWidth />
                  <Button variant="contained" color="secondary" startIcon={<Crown size={16} />} onClick={handleAdminPayout} disabled={actionLoading || !payoutData.circleId || !payoutData.memberUserId || payoutData.amount <= 0} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {actionLoading ? 'Processing...' : 'Process Payout'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <CheckCircle2 size={20} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Pending Verifications</Typography>
                </Stack>
                {pendingTransactions.length === 0 && (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <CheckCircle2 size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
                    <Typography variant="body2" color="text.secondary">All transactions verified.</Typography>
                  </Box>
                )}
                {pendingTransactions.map((tx) => {
                  const circle = circles.find((c) => c.id === tx.circleId);
                  const memberUser = users.find((u) => u.id === tx.userId);
                  return (
                    <Paper key={tx.id} variant="outlined" sx={{ p: 1.5, mb: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{tx.id}</Typography>
                          <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{circle?.name || tx.circleId} &middot; {memberUser?.name || tx.userId} &middot; {tx.amount.toLocaleString()}</Typography>
                        </Box>
                        <Button size="small" variant="contained" color="success" onClick={() => { setSelectedTxId(tx.id); setVerifyDialogOpen(true); }} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>Verify</Button>
                      </Stack>
                    </Paper>
                  );
                })}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Activity size={20} /><Typography variant="h6" sx={{ fontWeight: 600 }}>System Controls</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  <Button variant="outlined" startIcon={<RefreshCw size={16} />} onClick={handleManualCheck} fullWidth sx={{ fontFamily: "'JetBrains Mono', monospace", justifyContent: 'flex-start' }}>
                    Force Evaluate All Cycles
                  </Button>
                  <Button variant="outlined" color="warning" startIcon={<Bell size={16} />} onClick={() => { setNotifData({ title: 'System Maintenance', message: 'Scheduled maintenance at 2:00 AM WAT. Platform may be briefly unavailable.', targetUserId: '' }); setNotifDialogOpen(true); }} fullWidth sx={{ fontFamily: "'JetBrains Mono', monospace", justifyContent: 'flex-start' }}>
                    Send Maintenance Alert
                  </Button>
                  <Button variant="outlined" color="success" startIcon={<ListChecks size={16} />} onClick={() => { circles.forEach((c) => evaluateCyclePayout(c.id)); setActionSuccess('Ledger audit completed.'); }} fullWidth sx={{ fontFamily: "'JetBrains Mono', monospace", justifyContent: 'flex-start' }}>
                    Run Full Audit
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <ListChecks size={20} /><Typography variant="h6" sx={{ fontWeight: 600 }}>Audit Trail</Typography>
              <Chip label={`${auditLogs.length} Entries`} size="small" color="primary" sx={{ fontFamily: "'JetBrains Mono', monospace" }} />
            </Stack>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 520 }}>
              <Table size="small" stickyHeader>
                <TableHead><TableRow>
                  <TableCell>Timestamp</TableCell><TableCell>User</TableCell><TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell><TableCell>Entity ID</TableCell><TableCell>Details</TableCell>
                </TableRow></TableHead>
                <TableBody>
                  {auditLogs.length === 0 && (
                    <TableRow><TableCell colSpan={6} align="center"><Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>{getEmptyStateMessage('auditLogs')}</Typography></TableCell></TableRow>
                  )}
                  {[...auditLogs].reverse().map((log) => {
                    const logUser = users.find((u) => u.id === log.userId);
                    return (
                      <TableRow key={log.id} hover>
                        <TableCell><Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: 'text.secondary' }}>{formatTime(log.createdAt)}</Typography></TableCell>
                        <TableCell><Typography variant="body2" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{logUser?.name || log.userId}</Typography></TableCell>
                        <TableCell><Chip label={log.action} size="small" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, bgcolor: log.action.includes('CREATE') || log.action.includes('REGISTER') ? 'rgba(46,125,50,0.12)' : log.action.includes('DELETE') ? 'rgba(211,47,47,0.12)' : log.action.includes('PAYOUT') || log.action.includes('VERIFY') ? 'rgba(2,136,209,0.12)' : 'rgba(255,143,0,0.12)', color: log.action.includes('CREATE') || log.action.includes('REGISTER') ? '#2e7d32' : log.action.includes('DELETE') ? '#d32f2f' : log.action.includes('PAYOUT') || log.action.includes('VERIFY') ? '#0288d1' : '#ff8f00' }} /></TableCell>
                        <TableCell><Chip label={log.entityType} size="small" variant="outlined" sx={{ fontFamily: "'JetBrains Mono', monospace" }} /></TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: 'text.secondary' }}>{log.entityId}</Typography></TableCell>
                        <TableCell><Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: 'text.secondary' }}>{JSON.stringify(log.details).slice(0, 60)}{JSON.stringify(log.details).length > 60 ? '...' : ''}</Typography></TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      <Dialog open={notifDialogOpen} onClose={() => setNotifDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>Send System Notification</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={notifData.title} onChange={(e) => setNotifData({ ...notifData, title: e.target.value })} fullWidth size="small" />
            <TextField label="Message" value={notifData.message} onChange={(e) => setNotifData({ ...notifData, message: e.target.value })} fullWidth size="small" multiline rows={3} />
            <TextField select label="Target" value={notifData.targetUserId} onChange={(e) => setNotifData({ ...notifData, targetUserId: e.target.value })} fullWidth size="small">
              <MenuItem value="">All Users (Broadcast)</MenuItem>
              {users.map((u) => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotifDialogOpen(false)} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>Cancel</Button>
          <Button variant="contained" onClick={handleSendNotification} disabled={actionLoading || !notifData.title || !notifData.message} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{actionLoading ? 'Sending...' : 'Send'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={payoutDialogOpen} onClose={() => setPayoutDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>Admin Payout Override</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label="Circle" value={payoutData.circleId} onChange={(e) => {
              const cId = e.target.value;
              const c = circles.find((cir) => cir.id === cId);
              const members = circleMembers.filter((m) => m.circleId === cId);
              setPayoutData({ ...payoutData, circleId: cId, memberUserId: members[0]?.userId || '', amount: c ? c.contributionAmount * Math.max(members.length, 1) : 0 });
            }} fullWidth size="small">
              {circles.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </TextField>
            <TextField select label="Recipient" value={payoutData.memberUserId} onChange={(e) => setPayoutData({ ...payoutData, memberUserId: e.target.value })} fullWidth size="small">
              {payoutData.circleId && circleMembers.filter((m) => m.circleId === payoutData.circleId).map((m) => {
                const u = users.find((us) => us.id === m.userId);
                return <MenuItem key={m.id} value={m.userId}>{u?.name || 'Unknown'}</MenuItem>;
              })}
            </TextField>
            <TextField label="Amount" type="number" value={payoutData.amount} onChange={(e) => setPayoutData({ ...payoutData, amount: parseInt(e.target.value) || 0 })} fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayoutDialogOpen(false)} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>Cancel</Button>
          <Button variant="contained" color="secondary" onClick={handleAdminPayout} disabled={actionLoading || !payoutData.circleId || !payoutData.memberUserId || payoutData.amount <= 0} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{actionLoading ? 'Processing...' : 'Process'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={verifyDialogOpen} onClose={() => setVerifyDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>Verify Transaction</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>Verify transaction <strong>{selectedTxId}</strong>?</Typography>
          <Alert severity="info" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>This marks the transaction as verified.</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleVerifyTransaction} disabled={actionLoading} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{actionLoading ? 'Verifying...' : 'Verify'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>Delete Circle</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>Permanently delete this circle and all member associations?</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteCircle} disabled={actionLoading} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{actionLoading ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTerminal;
