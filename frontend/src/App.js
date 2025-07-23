import React, { useState, useEffect } from 'react';
import { Container, TextField, Button, Box, Typography, Card, CardContent, CircularProgress, Link, Paper, AppBar, Toolbar, IconButton } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import BarChartIcon from '@mui/icons-material/BarChart';
import axios from 'axios';
import { Log } from './utils/logger';

const API_URL = 'http://localhost:8000';

function App() {
  const [view, setView] = useState('shortener');
  const [viewingCode, setViewingCode] = useState(''); 
  const [url, setUrl] = useState('');
  const [shortcode, setShortcode] = useState('');
  const [validity, setValidity] = useState(30);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [shortenedLinks, setShortenedLinks] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    try {
      const storedLinks = JSON.parse(localStorage.getItem('shortenedLinks')) || [];
      setShortenedLinks(storedLinks);
      Log('frontend', 'info', 'component', 'Loaded links from local storage');
    } catch (e) {
      Log('frontend', 'error', 'component', 'Failed to parse links from local storage');
      setShortenedLinks([]);
    }
  }, []);

  const handleShorten = async () => {
    if (!url) {
      setError('Please enter a URL.');
      Log('frontend', 'warn', 'validation', 'User tried to shorten an empty URL');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    Log('frontend', 'info', 'api', 'Sending request to shorten URL');
    try {
      const response = await axios.post(`${API_URL}/shorturls`, {
        url,
        shortcode: shortcode || undefined,
        validity: validity || undefined,
      });
      setResult(response.data);

      const newLink = {
        originalUrl: url,
        shortlink: response.data.shortlink,
        expiry: response.data.expiry,
        shortcode: response.data.shortlink.split('/').pop(),
      };
      const updatedLinks = [...shortenedLinks, newLink];
      setShortenedLinks(updatedLinks);
      localStorage.setItem('shortenedLinks', JSON.stringify(updatedLinks));
      Log('frontend', 'info', 'api', `Successfully shortened URL: ${url}`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An error occurred.';
      setError(errorMessage);
      Log('frontend', 'error', 'api', `Failed to shorten URL: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (code) => {
    Log('frontend', 'info', 'api', `Fetching stats for shortcode: ${code}`);
    setViewingCode(code);
    try {
      const response = await axios.get(`${API_URL}/shorturls/${code}`);
      setStats(response.data);
      setView('statsDetail');
    } catch (err) {
      Log('frontend', 'error', 'api', `Failed to fetch stats for ${code}`);
      alert('Could not fetch stats for this link.');
    }
  };

  const renderShortenerPage = () => (
    <Box>
      <Typography variant="h4" gutterBottom>URL Shortener</Typography>
      <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <TextField
          fullWidth
          label="Original URL"
          variant="outlined"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Custom Shortcode (Optional)"
          variant="outlined"
          value={shortcode}
          onChange={(e) => setShortcode(e.target.value)}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Validity in Minutes (Optional, default 30)"
          type="number"
          variant="outlined"
          value={validity}
          onChange={(e) => setValidity(e.target.value)}
          margin="normal"
        />
        <Button
          variant="contained"
          size="large"
          onClick={handleShorten}
          disabled={loading}
          sx={{ mt: 2 }}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LinkIcon />}
        >
          {loading ? 'Shortening...' : 'Shorten URL'}
        </Button>
        {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        {result && (
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6">Success!</Typography>
              <Typography>Short Link: <Link href={result.shortlink} target="_blank" rel="noopener">{result.shortlink}</Link></Typography>
              <Typography>Expires: {new Date(result.expiry).toLocaleString()}</Typography>
            </CardContent>
          </Card>
        )}
      </Paper>
    </Box>
  );

  const renderStatsListPage = () => (
    <Box>
      <Typography variant="h4" gutterBottom>Shortened URL Statistics</Typography>
      {shortenedLinks.length === 0 ? (
        <Typography>You haven't shortened any links yet.</Typography>
      ) : (
        shortenedLinks.map((link, index) => (
          <Paper key={index} elevation={3} sx={{ p: 2, mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body1">
                <Link href={link.shortlink} target="_blank" rel="noopener">{link.shortlink}</Link>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Original: {link.originalUrl.length > 50 ? `${link.originalUrl.substring(0, 50)}...` : link.originalUrl}
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => fetchStats(link.shortcode)}>View Stats</Button>
          </Paper>
        ))
      )}
    </Box>
  );

  const renderStatsDetailPage = () => (
    <Box>
      <Button onClick={() => setView('statsList')}>&larr; Back to List</Button>
      <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>Statistics</Typography>
      {stats && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6">Shortened URL: <Link href={`${API_URL}/${viewingCode}`} target="_blank">{`${API_URL}/${viewingCode}`}</Link></Typography>
          <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>Original URL: <Link href={stats.originalUrl} target="_blank">{stats.originalUrl}</Link></Typography>          <Typography>Created: {new Date(stats.creationDate).toLocaleString()}</Typography>
          <Typography>Expires: {new Date(stats.expiryDate).toLocaleString()}</Typography>
          <Typography variant="h6" sx={{ mt: 2 }}>Total Clicks: {stats.totalClicks}</Typography>
          {stats.clickData.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1">Click Details:</Typography>
              {stats.clickData.map((click, index) => (
                <Typography key={index} variant="body2">
                  {index + 1}: {new Date(click.timestamp).toLocaleString()} - Location: {click.geo.location} - Referrer: {click.referrer}
                </Typography>
              ))}
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          <IconButton color="inherit" onClick={() => { setView('shortener'); Log('frontend', 'info', 'navigation', 'Navigated to Shortener page'); }}>
            <LinkIcon />
          </IconButton>
          <IconButton color="inherit" onClick={() => { setView('statsList'); Log('frontend', 'info', 'navigation', 'Navigated to Stats page'); }}>
            <BarChartIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        {view === 'shortener' && renderShortenerPage()}
        {view === 'statsList' && renderStatsListPage()}
        {view === 'statsDetail' && renderStatsDetailPage()}
      </Container>
    </>
  );
}

export default App;