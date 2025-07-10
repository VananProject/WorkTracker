import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatSafeDate } from './dateUtils';
import type { Task, UserGroup } from '../types/TaskHistoryTypes';

// CSV Export Function
export const exportToCSV = (
  data: Task[] | UserGroup[], 
  isAdmin: boolean, 
  formatTime: (seconds: number) => string,
  filename?: string
) => {
  try {
    let csvContent = '';
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `task-history-${timestamp}.csv`;
    
    if (isAdmin) {
      // Admin view - export user groups and their tasks
      csvContent = 'User Email,Username,Task Name,Task ID,Type,Status,Duration,Activities Count,Source,Last Activity\n';
      
      (data as UserGroup[]).forEach(userGroup => {
        userGroup.tasks.forEach(task => {
          const row = [
            userGroup.userEmail || '',
            userGroup.username || '',
            task.taskName || '',
            task.taskId || '',
            task.type || '',
            task.status || '',
            formatTime(task.totalDuration || 0),
            task.activities?.length || 0,
            task.isAssigned ? 'Assigned' : 'Self-created',
            formatSafeDate(task.updatedAt || task.createdAt)
          ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
          
          csvContent += row + '\n';
        });
      });
    } else {
      // User view - export individual tasks
      csvContent = 'Task Name,Task ID,Type,Status,Duration,Activities Count,Source,Username,Last Activity\n';
      
      (data as Task[]).forEach(task => {
        const row = [
          task.taskName || '',
          task.taskId || '',
          task.type || '',
          task.status || '',
          formatTime(task.totalDuration || 0),
          task.activities?.length || 0,
          task.isAssigned ? 'Assigned' : 'Self-created',
          task.username || '',
          formatSafeDate(task.updatedAt || task.createdAt)
        ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        
        csvContent += row + '\n';
      });
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename || defaultFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return false;
  }
};

// PDF Export Function
export const exportToPDF = (
  data: Task[] | UserGroup[], 
  isAdmin: boolean, 
  formatTime: (seconds: number) => string,
  filename?: string
) => {
  try {
    const doc = new jsPDF();
    const timestamp = new Date().toISOString().split('T')[0];
    const defaultFilename = `task-history-${timestamp}.pdf`;
    
    // Add title
    doc.setFontSize(20);
    doc.text(isAdmin ? 'All Tasks History Report' : 'My Task History Report', 14, 22);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 32);
    
    let tableData: any[] = [];
    let headers: string[] = [];
    
    if (isAdmin) {
      headers = ['User Email', 'Username', 'Task Name', 'Type', 'Status', 'Duration', 'Activities', 'Source'];
      
      (data as UserGroup[]).forEach(userGroup => {
        userGroup.tasks.forEach(task => {
          tableData.push([
            userGroup.userEmail || '',
            userGroup.username || '',
            task.taskName || '',
            task.type || '',
            task.status || '',
            formatTime(task.totalDuration || 0),
            task.activities?.length || 0,
            task.isAssigned ? 'Assigned' : 'Self-created'
          ]);
        });
      });
    } else {
      headers = ['Task Name', 'Type', 'Status', 'Duration', 'Activities', 'Source', 'Username'];
      
      (data as Task[]).forEach(task => {
        tableData.push([
          task.taskName || '',
          task.type || '',
          task.status || '',
          formatTime(task.totalDuration || 0),
          task.activities?.length || 0,
          task.isAssigned ? 'Assigned' : 'Self-created',
          task.username || ''
        ]);
      });
    }

    // Add table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 40 },
    });

    // Add summary statistics
    const finalY = (doc as any).lastAutoTable.finalY || 40;
    doc.setFontSize(12);
    doc.text('Summary Statistics:', 14, finalY + 20);
    
    doc.setFontSize(10);
    if (isAdmin) {
      const totalUsers = data.length;
      const totalTasks = (data as UserGroup[]).reduce((sum, user) => sum + user.totalTasks, 0);
      const totalDuration = (data as UserGroup[]).reduce((sum, user) => sum + user.totalDuration, 0);
      
      doc.text(`Total Users: ${totalUsers}`, 14, finalY + 30);
      doc.text(`Total Tasks: ${totalTasks}`, 14, finalY + 40);
      doc.text(`Total Duration: ${formatTime(totalDuration)}`, 14, finalY + 50);
    } else {
      const totalTasks = data.length;
      const completedTasks = (data as Task[]).filter(task => task.status === 'ended').length;
      const totalDuration = (data as Task[]).reduce((sum, task) => sum + (task.totalDuration || 0), 0);
      
      doc.text(`Total Tasks: ${totalTasks}`, 14, finalY + 30);
      doc.text(`Completed Tasks: ${completedTasks}`, 14, finalY + 40);
      doc.text(`Total Duration: ${formatTime(totalDuration)}`, 14, finalY + 50);
    }

    // Save the PDF
    doc.save(filename || defaultFilename);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};
