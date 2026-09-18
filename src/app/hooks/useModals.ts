import { useCallback, useState } from 'react';

export type ModalName =
  | 'workshop'
  | 'passengerLog'
  | 'station'
  | 'weather'
  | 'photo'
  | 'achievements'
  | 'help';

export type ModalState = Record<ModalName, boolean>;

const INITIAL_MODAL_STATE: ModalState = {
  workshop: false,
  passengerLog: false,
  station: false,
  weather: false,
  photo: false,
  achievements: false,
  help: false,
};

export function useModals() {
  const [modals, setModals] = useState<ModalState>(INITIAL_MODAL_STATE);

  const openModal = useCallback((name: ModalName) => {
    setModals((current) => ({ ...current, [name]: true }));
  }, []);

  const closeModal = useCallback((name: ModalName) => {
    setModals((current) => ({ ...current, [name]: false }));
  }, []);

  const setModal = useCallback((name: ModalName, open: boolean) => {
    setModals((current) => ({ ...current, [name]: open }));
  }, []);

  return { modals, openModal, closeModal, setModal };
}
