import { Modal, View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';

type Props = {
  visible: boolean;
  onClose?: () => void; // X 버튼 눌렀을 때 (선택사항)
};

export default function LoadingModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {onClose && (
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          )}

          <Text style={styles.title}>현재 변환 중입니다.</Text>

          <ActivityIndicator
            size="large"
            color="#7EA4CC"
            style={{ marginVertical: 30, paddingVertical: 20 }}
          />

          <Text style={styles.description}>
            잠시만 기다려주세요.{'\n'}완료 후 자동으로 페이지가 전환됩니다.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '85%',
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  closeText: {
    fontSize: 18,
    color: '#aaa',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7EA4CC',
    paddingVertical: 20,
  },
  description: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#333',
    fontSize: 14,
    lineHeight: 22,
  },
});
