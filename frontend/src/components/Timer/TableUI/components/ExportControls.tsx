import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  FileDownload,
  PictureAsPdf,
  TableChart
} from '@mui/icons-material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Task, UserGroup } from '../types/TaskHistoryTypes';

interface ExportControlsProps {
  data: Task[] | UserGroup[];
  isAdmin: boolean;
  formatTime: (seconds: number) => string;
  disabled?: boolean;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  data,
  isAdmin,
  formatTime,
  disabled = false
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportToCSV = () => {
    try {
      setIsExporting(true);
      
      let csvContent = '';
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${isAdmin ? 'all-tasks' : 'my-tasks'}-${timestamp}.csv`;

      if (isAdmin && data.length > 0 && 'userEmail' in data[0]) {
        // Admin view - export user groups
        const userGroups = data as UserGroup[];
        const headers = ['User', 'Email', 'Total Tasks', 'Completed', 'Active', 'Assigned', 'Total Duration'];
        csvContent = headers.join(',') + '\n';
        
        userGroups.forEach(group => {
          const row = [
            `"${group.username}"`,
            `"${group.userEmail}"`,
            group.totalTasks,
            group.completedTasks,
            group.activeTasks,
            group.assignedTasks,
            `"${formatTime(group.totalDuration)}"`
          ];
          csvContent += row.join(',') + '\n';
        });
      } else {
        // Regular view - export tasks
        const tasks = data as Task[];
        const headers = ['Task Name', 'Type', 'Status', 'Duration', 'User', 'Assignment Info', 'Created At'];
        csvContent = headers.join(',') + '\n';
        
        tasks.forEach(task => {
          const assignmentInfo = task.isAssigned ? 'Assigned' : 'Self-created';
          const createdAt = task.createdAt ? new Date(task.createdAt).toLocaleString() : '';
          
          const row = [
            `"${task.taskName || ''}"`,
            `"${task.type || ''}"`,
            `"${task.status || ''}"`,
            `"${formatTime(task.totalDuration || 0)}"`,
            `"${task.username || task.userEmail?.split('@')[0] || 'Unknown'}"`,
            `"${assignmentInfo}"`,
            `"${createdAt}"`
          ];
          csvContent += row.join(',') + '\n';
        });
      }

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportStatus({
        open: true,
        message: 'Successfully exported to CSV',
        severity: 'success'
      });

    } catch (error) {
      console.error('CSV Export error:', error);
      setExportStatus({
        open: true,
        message: 'Failed to export CSV. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsExporting(false);
      handleClose();
    }
  };

  const exportToPDF = () => {
    try {
      setIsExporting(true);
      console.log('Starting PDF export...', { dataLength: data.length, isAdmin });
      
      const doc = new jsPDF();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${isAdmin ? 'all-tasks' : 'my-tasks'}-${timestamp}.pdf`;

      // Add title
      doc.setFontSize(20);
      doc.text(isAdmin ? 'All Tasks Report' : 'My Tasks Report', 20, 20);
      
      // Add generation date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 35);
      doc.text(`Total Records: ${data.length}`, 20, 45);

      // Check if we have data
      if (!data || data.length === 0) {
        doc.setFontSize(14);
        doc.text('No data available to export.', 20, 70);
      } else {
        try {
          if (isAdmin && 'userEmail' in data[0]) {
            // Admin view - export user groups
            const userGroups = data as UserGroup[];
            console.log('Exporting user groups:', userGroups.length);
            
            const tableData = userGroups.map(group => [
              group.username || 'N/A',
              group.userEmail || 'N/A',
              (group.totalTasks || 0).toString(),
              (group.completedTasks || 0).toString(),
              (group.activeTasks || 0).toString(),
              (group.assignedTasks || 0).toString(),
              formatTime(group.totalDuration || 0)
            ]);

            autoTable(doc, {
              head: [['User', 'Email', 'Total Tasks', 'Completed', 'Active', 'Assigned', 'Duration']],
              body: tableData,
              startY: 55,
              styles: {
                fontSize: 8,
                cellPadding: 3,
              },
              headStyles: {
                fillColor: [63, 81, 181],
                textColor: 255,
                fontStyle: 'bold',
              },
              alternateRowStyles: {
                fillColor: [245, 245, 245],
              },
              margin: { top: 55 },
            });
          } else {
            // Regular view - export tasks
            const tasks = data as Task[];
            console.log('Exporting tasks:', tasks.length);
            
            const tableData = tasks.map(task => [
              task.taskName || 'N/A',
              task.type || 'N/A',
              task.status || 'N/A',
              formatTime(task.totalDuration || 0),
              task.username || task.userEmail?.split('@')[0] || 'Unknown',
              task.isAssigned ? 'Assigned' : 'Self-created',
              task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'
            ]);

            autoTable(doc, {
              head: [['Task Name', 'Type', 'Status', 'Duration', 'User', 'Source', 'Created']],
              body: tableData,
              startY: 55,
              styles: {
                fontSize: 8,
                cellPadding: 3,
              },
              headStyles: {
                fillColor: [63, 81, 181],
                textColor: 255,
                fontStyle: 'bold',
              },
              alternateRowStyles: {
                fillColor: [245, 245, 245],
              },
              margin: { top: 55 },
            });
          }
        } catch (tableError) {
          console.error('AutoTable error:', tableError);
          // Fallback to simple text if autoTable fails
          doc.setFontSize(10);
          doc.text('Error generating table. Raw data:', 20, 70);
          doc.text(JSON.stringify(data.slice(0, 3), null, 2), 20, 80);
        }
      }

      // Add footer
    // Replace the footer section with this corrected version:

// Add footer
const pageCount = (doc as any).internal.getNumberOfPages();
for (let i = 1; i <= pageCount; i++) {
  doc.setPage(i);
  doc.setFontSize(10);
  doc.text(
    `Page ${i} of ${pageCount}`,
    doc.internal.pageSize.width - 30,
    doc.internal.pageSize.height - 10
  );
}


      // Save the PDF
      console.log('Saving PDF:', filename);
      doc.save(filename);

      setExportStatus({
        open: true,
        message: 'Successfully exported to PDF',
        severity: 'success'
      });

    } catch (error) {
      console.error('PDF Export error:', error);
      setExportStatus({
        open: true,
        message: `Failed to export PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setIsExporting(false);
      handleClose();
    }
  };

  const handleCloseSnackbar = () => {
    setExportStatus(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={isExporting ? <CircularProgress size={16} /> : <FileDownload />}
        onClick={handleClick}
        disabled={disabled || isExporting || data.length === 0}
        size="small"
        sx={{
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500,
        }}
      >
        {isExporting ? 'Exporting...' : `Export (${data.length})`}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.08)',
          }
        }}
      >
        <MenuItem 
          onClick={exportToCSV}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(76, 175, 80, 0.08)',
            }
          }}
        >
          <ListItemIcon>
            <TableChart fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>
            <Box>
              <Box sx={{ fontWeight: 500 }}>Export as CSV</Box>
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                Comma-separated values
              </Box>
            </Box>
          </ListItemText>
        </MenuItem>
        
        <MenuItem 
          onClick={exportToPDF}
          sx={{
            py: 1.5,
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.08)',
            }
          }}
        >
          <ListItemIcon>
            <PictureAsPdf fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>
            <Box>
              <Box sx={{ fontWeight: 500 }}>Export as PDF</Box>
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                Portable document format
              </Box>
            </Box>
          </ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={exportStatus.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={exportStatus.severity}
          variant="filled"
          sx={{ borderRadius: 2 }}
        >
          {exportStatus.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportControls;
