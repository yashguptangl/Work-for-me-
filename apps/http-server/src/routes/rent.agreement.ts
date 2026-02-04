import { Router } from 'express';
import {
  createRentAgreement,
  getUserRentAgreements,
  getRentAgreementById,
  updatePaymentStatus,
  updateDocumentStatus,
  deleteRentAgreement,
  downloadRentAgreementPDF,
} from '../controllers/rent.agreement.controllers';
import { authenticateJWT, optionalAuth } from '../middleware/auth';

const router = Router();

// Create new rent agreement (allows both authenticated and unauthenticated users)
router.post('/', optionalAuth, createRentAgreement);

// Get all rent agreements for logged-in user
router.get('/', authenticateJWT, getUserRentAgreements);

// Get specific rent agreement by ID
router.get('/:id', authenticateJWT, getRentAgreementById);

// Download rent agreement PDF
router.get('/:id/download', authenticateJWT, downloadRentAgreementPDF);

// Update payment status (allows both authenticated and unauthenticated users)
router.patch('/:id/payment', optionalAuth, updatePaymentStatus);

// Update document status
router.patch('/:id/document', authenticateJWT, updateDocumentStatus);

// Delete rent agreement
router.delete('/:id', authenticateJWT, deleteRentAgreement);

export default router;
