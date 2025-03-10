import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName: string;
  reviewCount: number;
  isLoading: boolean;
}

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  fileName,
  reviewCount,
  isLoading
}: DeleteConfirmationDialogProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <Box display="flex" alignItems="center" gap={1}>
          <WarningIcon color="error" />
          <Typography>Delete Reviews</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box id="alert-dialog-description">
          <Box mb={2}>
            Are you sure you want to delete <strong>{fileName}</strong>?
          </Box>
          <Typography variant="body2" color="text.secondary">
            This will permanently delete {reviewCount} review{reviewCount !== 1 ? 's' : ''}.
            This action cannot be undone.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} size="small">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          size="small"
          disabled={isLoading}
        >
          {isLoading ? 'Deleting...' : 'Delete Reviews'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog; 