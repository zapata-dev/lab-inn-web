import { useToastContext } from '../context/ToastContext'

function useToast() {
  const { toast } = useToastContext()
  return toast
}

export default useToast
