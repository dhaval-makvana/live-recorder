import styled from "@emotion/styled/macro";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

export const VideoContainer = styled.div`
  flex: 1;
  overflow: hidden;
`;

export const VideoPlayer = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const ControlPanel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #333;
  padding: 10px;
`;

export const Button = styled.button`
  margin: 0 5px;
  padding: 10px 20px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:disabled {
    background-color: grey;
    cursor: not-allowed;
  }
`;
