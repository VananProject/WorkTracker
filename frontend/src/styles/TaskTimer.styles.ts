// import { SxProps, Theme } from '@mui/material';

import type { SxProps, Theme } from "@mui/material/styles";

export const timerStyles: Record<string, SxProps<Theme>> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 4,
    maxWidth: 800,
    margin: '0 auto',
    gap: 3,
  },

  title: {
    fontWeight: 'bold',
    color: 'primary.main',
    marginBottom: 2,
  },

  alert: {
    width: '100%',
    marginBottom: 2,
  },

  startButtons: {
    display: 'flex',
    gap: 2,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  startButton: {
    minWidth: 150,
    height: 56,
    fontSize: '1.1rem',
  },

  timerSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    width: '100%',
  },

  timer: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: 'primary.main',
    textAlign: 'center',
    padding: 2,
    border: '2px solid',
    borderColor: 'primary.main',
    borderRadius: 2,
    backgroundColor: 'background.paper',
    minWidth: 300,
  },

  statusChip: {
    marginBottom: 1,
  },

  controlButtons: {
    display: 'flex',
    gap: 1.5,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 2,
  },
  timerDisplay: {
    textAlign: 'center',
    marginBottom: 3,
    padding: 3,
    borderRadius: 2,
    backgroundColor: 'background.paper',
    boxShadow: 2,
    minWidth: 300,
  },
  timeText: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: 'primary.main',
  },
  buttonGroup: {
    display: 'flex',
    gap: 2,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 2,
  },
  button: {
    minWidth: 120,
    height: 48,
  },
};
