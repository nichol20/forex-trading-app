import styles from './style.module.scss'
import { ClosableElement } from '../ClosableElement'
import { closeIcon } from '../../assets'

interface ModalProps {
    className?: string
    children: React.ReactNode
    close: () => void
}

export const Modal = ({ className, children, close }: ModalProps) => {

    className = className ? className : ''

    return (
        <div className={`${styles.fixedBox}`}>
            <ClosableElement isOpen={true} close={close} className={`${styles.modal} ${className}`}>
                <button className={styles.closeBtn} onClick={close}>
                    <img src={closeIcon} alt='x' />
                </button>
                {children}
            </ClosableElement>
        </div>
    )
}