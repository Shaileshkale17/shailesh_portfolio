import { AnimatePresence, motion } from "framer-motion";

/**
 * @param {{ open: boolean, title: string, description?: string, confirmLabel?: string, danger?: boolean, onConfirm: () => void, onCancel: () => void }} props
 */
const ConfirmDialog = ({ open, title, description, confirmLabel = "Delete", danger = true, onConfirm, onCancel }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-50 grid place-items-center bg-black/60 px-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="card w-full max-w-sm"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="font-heading text-lg font-semibold text-text">{title}</h3>
          {description && <p className="mt-2 text-sm text-text-secondary">{description}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button
              className={
                danger
                  ? "inline-flex items-center justify-center rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  : "btn-primary"
              }
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default ConfirmDialog;
