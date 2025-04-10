// components/GenerateByTextModal.tsx
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  value: string;
  onChange: (text: string) => void;
  onSubmit: () => void;
};

export default function GenerateByTextModal({
  visible,
  onClose,
  value,
  onChange,
  onSubmit,
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

                <Text style={styles.title}>어떤 이미지를 원하시나요?</Text>
                <Text style={styles.desc}>
                  원하는 이미지를 아래에 입력해 주세요.{'\n'}선택한 화풍이 반영된 이미지가
                  생성됩니다.
                </Text>

                <TextInput
                  style={styles.textInput}
                  multiline
                  maxLength={500}
                  placeholder="예시 : 장화 신은 고양이 이미지 만들어줘!"
                  placeholderTextColor="#ccc"
                  value={value}
                  onChangeText={onChange}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                    <Text style={styles.cancelText}>뒤로 가기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={onSubmit}>
                    <Text style={styles.confirmText}>확인</Text>
                  </TouchableOpacity>
                </View>
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
    width: '85%',
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 30,
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
    marginVertical: 20,
    textAlign: 'center',
  },
  desc: {
    fontSize: 13,
    color: '#777',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    height: 250,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    backgroundColor: '#fafafa',
    textAlignVertical: 'top',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    borderColor: '#7EA4CC',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#7EA4CC',
    fontWeight: 'bold',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#7EA4CC',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
