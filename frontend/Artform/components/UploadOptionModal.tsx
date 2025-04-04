// components/UploadOptionModal.tsx
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ICONS } from '~/constants/icons';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPickFromLibrary: () => void;
  onPickFromCamera: () => void;
  onGenerateByText: () => void;
};

export default function UploadOptionModal({
  visible,
  onClose,
  onPickFromLibrary,
  onPickFromCamera,
  onGenerateByText,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.modalBox}>
                <TouchableOpacity style={styles.close} onPress={onClose}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>

                <ICONS.palette width={60} height={60} style={{ marginVertical: 20 }} />

                <Text style={styles.title}>이미지를 어떻게 추가할까요?</Text>

                <Pressable style={styles.button} onPress={onGenerateByText}>
                  <View style={styles.iconLeft}>
                    <ICONS.text width={20} height={20} />
                  </View>
                  <Text style={styles.btnText}>텍스트로 생성</Text>
                </Pressable>

                <Pressable style={styles.button} onPress={onPickFromLibrary}>
                  <View style={styles.iconLeft}>
                    <ICONS.gallery width={20} height={20} />
                  </View>
                  <Text style={styles.btnText}>갤러리</Text>
                </Pressable>

                <Pressable style={styles.button} onPress={onPickFromCamera}>
                  <View style={styles.iconLeft}>
                    <ICONS.camera width={20} height={20} />
                  </View>
                  <Text style={styles.btnText}>카메라</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
  },
  modalBox: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: '85%',
    alignItems: 'center',
    position: 'relative',
  },
  close: {
    position: 'absolute',
    top: 14,
    right: 14,
  },
  closeText: {
    fontSize: 18,
    color: '#888',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#7EA4CC',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
  },
  iconLeft: {
    position: 'absolute',
    left: 20,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    flex: 1,
  },
});
