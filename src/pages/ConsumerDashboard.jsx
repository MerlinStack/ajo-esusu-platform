import React, { useState, useMemo } from 'react';
import {
  Grid, Card, CardContent, Typography, Box, LinearProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Avatar, Tooltip, Stack, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Alert, IconButton,
} from '@mui/material';
import {
  Users, ArrowRight, Crown, FileSpreadsheet, CheckCircle2,
  Wallet, Clock, PiggyBank, Plus, LogIn, CircleDot,
  UserCheck, TrendingUp, X, Info, BellRing,
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import useDataEngine from '../hooks/useDataEngine';

const ConsumerDashboard = () => {
  const auth = useAppStore((s) => s.auth);
  const circles = useAppStore((s) => s.circles);
  const circleMembers = useAppStore((s) => s.circleMembers);
  const transactions = useAppStore((s) => s.transactions);
  const users = useAppStore((s) => s.users);
  const notifications = useAppStore((s) => s.notifications);
  const getTelemetryData = useAppStore((s) => s.getTelemetryData);

  const {
    joinCircle, recordContribution, createCircle,
    getEmptyStateMessage, calculateCreditRiskScore,
  } = useDataEngine();

  const telemetry = getTelemetryData();
  const currentUser = auth.currentUser;

  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const [newCircle, setNewCircle] = useState({
    name: '', description: '', contributionAmount: 10000, frequency: 'Weekly', maxMembers: 6,
  });

  const myMemberships = useMemo(
    () => circleMembers.filter((m) => m.userId === currentUser?.id),
    [circleMembers, currentUser?.id]
  );
  const myCircleIds = useMemo(() => new Set(myMemberships.map((m) => m.circleId)), [myMemberships]);
  const myCircles = useMemo(() => circles.filter((c) => myCircleIds.has(c.id)), [circles, myCircleIds]);
  const availableCircles = useMemo(
    () => circles.filter((c) => !myCircleIds.has(c.id) && c.status === 'active'),
    [circles, myCircleIds]
  );
  const myTransactions = useMemo(
    () => transactions.filter((tx) => tx.userId === currentUser?.id),
    [transactions, currentUser?.id]
  );
  const myNotifications = useMemo(
    () => notifications.filter((n) => n.userId === currentUser?.id || n.userId === null),
    [notifications, currentUser?.id]
  );

  const creditRisk = currentUser ? calculateCreditRiskScore(currentUser.id) : null;

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-NG', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getMemberStatus = (circle) => {
    const cycleContribs = transactions.filter(
      (tx) => tx.circleId === circle.id && tx.type === 'contribution' &&
        tx.metadata?.cycleIndex === circle.currentCycleIndex && tx.status === 'verified'
    );
    const paidUserIds = new Set(cycleContribs.map((tx) => tx.userId));
    return circleMembers
      .filter((m) => m.circleId === circle.id)
      .sort((a, b) => a.payoutOrder - b.payoutOrder)
      .map((m) => ({ member: m, user: users.find((u) => u.id === m.userId), hasPaid: paidUserIds.has(m.userId) }));
  };

  const totalMyContributions = myTransactions.filter((tx) => tx.type === 'contribution').reduce((s, tx) => s + tx.amount, 0);
  const totalMyPayouts = myTransactions.filter((tx) => tx.type === 'payout').reduce((s, tx) => s + tx.amount, 0);

  const handleContribute = async (circleId) => {
    setActionLoading(true); setActionError(null); setActionSuccess(null);
    const result = await recordContribution(circleId);
    setActionLoading(false);
    if (result.success) {
      setActionSuccess('Contribution recorded successfully!');
    } else {
      setActionError(result.error || 'Failed to record contribution.');
    }
  };

  const handleJoinCircle = async () => {
    if (!joinDialogOpen) return;
    setActionLoading(true); setActionError(null);
    const result = await joinCircle(joinDialogOpen);
    setActionLoading(false);
    if (result.success) {
      setActionSuccess('Joined circle successfully!');
      setJoinDialogOpen(false);
    } else {
      setActionError(result.error || 'Failed to join circle.');
    }
  };

  const handleCreateCircle = async () => {
    if (!newCircle.name || !newCircle.contributionAmount) {
      setActionError('Name and contribution amount are required.'); return;
    }
    setActionLoading(true); setActionError(null);
    const result = await createCircle(newCircle);
    setActionLoading(false);
    if (result.success) {
      setActionSuccess('Circle created successfully!');
      setCreateDialogOpen(false);
      setNewCircle({ name: '', description: '', contributionAmount: 10000, frequency: 'Weekly', maxMembers: 6 });
      if (result.circle) await joinCircle(result.circle.id);
    } else {
      setActionError(result.error || 'Failed to create circle.');
    }
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
          <PiggyBank size={28} /> My Savings Dashboard
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" size="small" startIcon={<Plus size={16} />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
            Create Circle
          </Button>
          {availableCircles.length > 0 && (
            <Button variant="contained" size="small" startIcon={<LogIn size={16} />}
              onClick={() => setJoinDialogOpen(availableCircles[0]?.id)}
              sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Join Circle
            </Button>
          )}
        </Stack>
      </Stack>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'primary.main' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">My Circles</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5 }}>{myCircles.length}</Typography>
                </Box>
                <CircleDot size={28} color="#00695c" opacity={0.6} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'success.main' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Saved</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: 'success.main' }}>
                    {totalMyContributions.toLocaleString()}
                  </Typography>
                </Box>
                <Wallet size={28} color="#2e7d32" opacity={0.6} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'info.main' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">Total Payouts</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: 'info.main' }}>
                    {totalMyPayouts.toLocaleString()}
                  </Typography>
                </Box>
                <TrendingUp size={28} color="#0288d1" opacity={0.6} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: '4px solid', borderColor: 'secondary.main' }}>
            <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">Credit Score</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mt: 0.5, color: 'secondary.main' }}>
                    {creditRisk?.score ?? 0}
                  </Typography>
                </Box>
                <UserCheck size={28} color="#ff8f00" opacity={0.6} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {myCircles.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <Info size={40} style={{ opacity: 0.3, marginBottom: 12 }} />
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            {getEmptyStateMessage('circles')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Join an existing circle or create a new one.
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Button variant="contained" startIcon={<Plus size={16} />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
              Create Circle
            </Button>
            {availableCircles.length > 0 && (
              <Button variant="outlined" startIcon={<LogIn size={16} />}
                onClick={() => setJoinDialogOpen(availableCircles[0]?.id)}
                sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Browse Circles
              </Button>
            )}
          </Stack>
        </Paper>
      )}

      <Grid container spacing={3}>
        {myCircles.map((circle) => {
          const cycleContribs = transactions.filter((tx) => tx.circleId === circle.id && tx.type === 'contribution' && tx.status === 'verified');
          const totalCycleAmount = cycleContribs.reduce((s, tx) => s + tx.amount, 0);
          const circleMemberCount = circleMembers.filter((m) => m.circleId === circle.id).length;
          const expectedTotal = circleMemberCount * circle.contributionAmount;
          const progress = expectedTotal > 0 ? Math.min((totalCycleAmount / expectedTotal) * 100, 100) : 0;
          const membersStatus = getMemberStatus(circle);
          const myMemberRecord = myMemberships.find((m) => m.circleId === circle.id);
          const myPayoutOrder = myMemberRecord?.payoutOrder ?? 0;

          return (
            <Grid item xs={12} key={circle.id}>
              <Card>
                <CardContent>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} sx={{ mb: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'rgba(0,105,92,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CircleDot size={22} color="#00695c" />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{circle.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{circle.description || 'No description'}</Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: { xs: 1, md: 0 } }}>
                      <Chip icon={<Clock size={14} />} label={circle.frequency} size="small" color="primary" variant="outlined" sx={{ fontFamily: "'JetBrains Mono', monospace" }} />
                      <Chip icon={<Users size={14} />} label={`${circleMemberCount}/${circle.maxMembers}`} size="small" sx={{ fontFamily: "'JetBrains Mono', monospace" }} />
                    </Stack>
                  </Stack>

                  <Box sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">Cycle {circle.currentCycleIndex + 1} / {circleMemberCount}</Typography>
                      <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>
                        {totalCycleAmount.toLocaleString()} / {expectedTotal.toLocaleString()}
                      </Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4, '& .MuiLinearProgress-bar': { borderRadius: 4, bgcolor: progress >= 100 ? '#2e7d32' : '#00695c' } }} />
                  </Box>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <Users size={16} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Payout Order:</Typography>
                  </Stack>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5, mb: 2 }}>
                    {membersStatus.map(({ member, user, hasPaid }, idx) => {
                      const isRecipient = member.payoutOrder === 0;
                      const isMe = member.userId === currentUser?.id;
                      return (
                        <React.Fragment key={member.id}>
                          {idx > 0 && <ArrowRight size={14} color="#888" />}
                          <Tooltip title={`${user?.name || 'Unknown'}${isRecipient ? ' (Next Payout)' : ''} | ${hasPaid ? 'Paid' : 'Pending'}${isMe ? ' (You)' : ''}`}>
                            <Chip
                              avatar={isRecipient ? <Avatar sx={{ bgcolor: '#ff8f00', width: 22, height: 22 }}><Crown size={10} /></Avatar> :
                                isMe ? <Avatar sx={{ bgcolor: '#00695c', width: 22, height: 22 }}><UserCheck size={10} /></Avatar> : undefined}
                              label={user?.name || 'Unknown'}
                              size="small"
                              sx={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: isRecipient ? 700 : isMe ? 600 : 400,
                                bgcolor: isRecipient ? 'rgba(255,143,0,0.15)' : hasPaid ? 'rgba(46,125,50,0.1)' : 'transparent',
                                border: isRecipient ? '2px solid #ff8f00' : isMe ? '2px solid #00695c' : hasPaid ? '1px solid #2e7d32' : '1px solid rgba(0,0,0,0.12)',
                                color: isRecipient ? '#ff8f00' : isMe ? '#00695c' : hasPaid ? '#2e7d32' : 'text.primary',
                              }}
                            />
                          </Tooltip>
                        </React.Fragment>
                      );
                    })}
                  </Box>

                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1.5 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Contribution per cycle</Typography>
                      <Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'primary.main' }}>
                        {circle.contributionAmount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="caption" color="text.secondary">Next Payout Amount</Typography>
                      <Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'secondary.main' }}>
                        {totalCycleAmount.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Typography variant="caption" color="text.secondary">My Position</Typography>
                      <Typography variant="body1" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: 'info.main' }}>
                        #{myPayoutOrder + 1} of {circleMemberCount}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained" size="small" startIcon={<Wallet size={16} />}
                      onClick={() => handleContribute(circle.id)}
                      disabled={actionLoading || membersStatus.find((m) => m.member.userId === currentUser?.id)?.hasPaid}
                      sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {membersStatus.find((m) => m.member.userId === currentUser?.id)?.hasPaid
                        ? 'Already Paid' : `Pay ${circle.contributionAmount.toLocaleString()}`}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <FileSpreadsheet size={20} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>My Personal Ledger</Typography>
                <Chip icon={<CheckCircle2 size={14} />} label={`${myTransactions.length} Records`} size="small" color="success" sx={{ fontFamily: "'JetBrains Mono', monospace" }} />
              </Stack>
              {myTransactions.length === 0 && (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">{getEmptyStateMessage('transactions')}</Typography>
                </Box>
              )}
              {myTransactions.length > 0 && (
                <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>TX ID</TableCell>
                        <TableCell>Circle</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...myTransactions].reverse().map((tx) => {
                        const circle = circles.find((c) => c.id === tx.circleId);
                        return (
                          <TableRow key={tx.id} hover>
                            <TableCell><Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: 'text.secondary' }}>{tx.id}</Typography></TableCell>
                            <TableCell><Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{circle ? circle.name : tx.circleId}</Typography></TableCell>
                            <TableCell>
                              <Chip icon={tx.type === 'contribution' ? <Wallet size={12} /> : <Crown size={12} />}
                                label={tx.type} size="small"
                                sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, bgcolor: tx.type === 'contribution' ? 'rgba(46,125,50,0.12)' : 'rgba(21,101,192,0.12)', color: tx.type === 'contribution' ? '#2e7d32' : '#1565c0' }} />
                            </TableCell>
                            <TableCell align="right"><Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: tx.type === 'contribution' ? '#2e7d32' : '#1565c0' }}>{tx.amount.toLocaleString()}</Typography></TableCell>
                            <TableCell><Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", color: 'text.secondary' }}>{formatTime(tx.timestamp)}</Typography></TableCell>
                            <TableCell><Chip icon={<CheckCircle2 size={12} />} label={tx.status} size="small" color="success" variant="outlined" sx={{ fontFamily: "'JetBrains Mono', monospace" }} /></TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {creditRisk && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <TrendingUp size={20} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>My Credit Risk Profile</Typography>
                  <Chip label={creditRisk.level} size="small"
                    sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                      bgcolor: creditRisk.level === 'excellent' ? 'rgba(46,125,50,0.12)' : creditRisk.level === 'good' ? 'rgba(2,136,209,0.12)' : creditRisk.level === 'fair' ? 'rgba(237,108,2,0.12)' : 'rgba(211,47,47,0.12)',
                      color: creditRisk.level === 'excellent' ? '#2e7d32' : creditRisk.level === 'good' ? '#0288d1' : creditRisk.level === 'fair' ? '#ed6c02' : '#d32f2f' }} />
                </Stack>
                <Typography variant="h3" sx={{ fontWeight: 700, color: 'secondary.main', mb: 2 }}>{creditRisk.score}/100</Typography>
                {creditRisk.factors.map((factor) => (
                  <Box key={factor.name} sx={{ mb: 1.5 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.3 }}>
                      <Typography variant="caption" color="text.secondary">{factor.name}</Typography>
                      <Typography variant="caption" sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{factor.score}</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={factor.score}
                      sx={{ height: 6, borderRadius: 3, '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: factor.score >= 30 ? '#2e7d32' : factor.score >= 20 ? '#0288d1' : '#ed6c02' } }} />
                  </Box>
                ))}
                <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <Typography variant="caption" color="text.secondary">
                    {creditRisk.contributionCount} contributions &middot; {creditRisk.payoutCount} payouts &middot; {creditRisk.totalContributions.toLocaleString()} total saved
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <BellRing size={20} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
                <Chip label={`${myNotifications.filter((n) => !n.read).length} Unread`} size="small" color="warning" sx={{ fontFamily: "'JetBrains Mono', monospace" }} />
              </Stack>
              {myNotifications.length === 0 && (
                <Box sx={{ py: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">{getEmptyStateMessage('notifications')}</Typography>
                </Box>
              )}
              <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                {myNotifications.slice(0, 10).map((n) => (
                  <Box key={n.id} sx={{ p: 1.5, mb: 0.5, borderRadius: 1, bgcolor: !n.read ? 'rgba(0,105,92,0.06)' : 'transparent', borderLeft: !n.read ? '3px solid #00695c' : '3px solid transparent' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: n.read ? 400 : 600, fontFamily: "'Inter', sans-serif", fontSize: '0.8rem' }}>{n.title}</Typography>
                      {!n.read && <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#00695c' }} />}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "'JetBrains Mono', monospace" }}>{n.message}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={Boolean(joinDialogOpen)} onClose={() => setJoinDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>Join a Savings Circle</DialogTitle>
        <DialogContent>
          {availableCircles.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No available circles to join.</Typography>
          )}
          {availableCircles.map((c) => (
            <Paper key={c.id} variant="outlined" sx={{ p: 2, mt: 1.5, cursor: 'pointer', borderColor: joinDialogOpen === c.id ? 'primary.main' : undefined, bgcolor: joinDialogOpen === c.id ? 'rgba(0,105,92,0.06)' : undefined }}
              onClick={() => setJoinDialogOpen(c.id)}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>{c.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{c.contributionAmount.toLocaleString()}/{c.frequency} &middot; {circleMembers.filter((m) => m.circleId === c.id).length}/{c.maxMembers} members</Typography>
                </Box>
                <Chip label="Join" size="small" color="primary" sx={{ fontFamily: "'JetBrains Mono', monospace" }} />
              </Stack>
            </Paper>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setJoinDialogOpen(false)} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>Cancel</Button>
          <Button variant="contained" onClick={handleJoinCircle} disabled={actionLoading || !joinDialogOpen} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {actionLoading ? 'Joining...' : 'Join'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>Create New Savings Circle</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Circle Name" value={newCircle.name} onChange={(e) => setNewCircle({ ...newCircle, name: e.target.value })} fullWidth size="small" />
            <TextField label="Description" value={newCircle.description} onChange={(e) => setNewCircle({ ...newCircle, description: e.target.value })} fullWidth size="small" multiline rows={2} />
            <TextField label="Contribution Amount" type="number" value={newCircle.contributionAmount} onChange={(e) => setNewCircle({ ...newCircle, contributionAmount: parseInt(e.target.value) || 0 })} fullWidth size="small" />
            <TextField select label="Frequency" value={newCircle.frequency} onChange={(e) => setNewCircle({ ...newCircle, frequency: e.target.value })} fullWidth size="small">
              <MenuItem value="Daily">Daily</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Biweekly">Biweekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
            </TextField>
            <TextField label="Max Members" type="number" value={newCircle.maxMembers} onChange={(e) => setNewCircle({ ...newCircle, maxMembers: parseInt(e.target.value) || 2 })} fullWidth size="small" inputProps={{ min: 2, max: 50 }} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateCircle} disabled={actionLoading || !newCircle.name} sx={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {actionLoading ? 'Creating...' : 'Create Circle'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsumerDashboard;
