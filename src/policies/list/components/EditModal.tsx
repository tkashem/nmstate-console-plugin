import React, { useState } from 'react';
import PolicyForm from 'src/components/PolicyForm/PolicyForm';
import NodeNetworkConfigurationPolicyModel from 'src/console-models/NodeNetworkConfigurationPolicyModel';
import { useNMStateTranslation } from 'src/utils/hooks/useNMStateTranslation';
import { useImmer } from 'use-immer';

import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import {
  ActionList,
  ActionListItem,
  Alert,
  AlertVariant,
  Button,
  Modal,
  Stack,
  StackItem,
} from '@patternfly/react-core';
import { V1NodeNetworkConfigurationPolicy } from '@types';

type EditModalProps = {
  closeModal?: () => void;
  isOpen?: boolean;
  policy: V1NodeNetworkConfigurationPolicy;
};

const EditModal: React.FC<EditModalProps> = ({ closeModal, isOpen, policy }) => {
  const { t } = useNMStateTranslation();
  const [error, setError] = useState(undefined);
  const [success, setSuccess] = useState(false);
  const [editablePolicy, setEditablePolicy] = useImmer(policy);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setSuccess(false);

    return k8sUpdate({
      model: NodeNetworkConfigurationPolicyModel,
      data: editablePolicy,
      ns: editablePolicy?.metadata?.namespace,
      name: editablePolicy?.metadata?.name,
    })
      .then(() => setSuccess(true))
      .catch(setError)
      .finally(() => {
        setError(undefined);
        setLoading(false);
      });
  };

  return (
    <Modal
      className="ocs-modal"
      onClose={closeModal}
      variant={'small'}
      title={t('Edit Node network configuration policy')}
      footer={
        <Stack className="edit-modal-footer pf-u-flex-fill" hasGutter>
          {success && (
            <StackItem>
              <Alert isInline variant={AlertVariant.success} title={t('Success')}>
                {t('Policy edited successfully')}
              </Alert>
            </StackItem>
          )}
          {error && (
            <StackItem>
              <Alert isInline variant={AlertVariant.danger} title={t('An error occurred')}>
                <Stack hasGutter>
                  <StackItem>{error.message}</StackItem>
                  {error?.href && (
                    <StackItem>
                      <a href={error.href} target="_blank" rel="noreferrer">
                        {error.href}
                      </a>
                    </StackItem>
                  )}
                </Stack>
              </Alert>
            </StackItem>
          )}
          <StackItem>
            <ActionList>
              <ActionListItem>
                <Button
                  onClick={handleSubmit}
                  isDisabled={loading}
                  isLoading={loading}
                  variant={'primary'}
                  form="edit-policy-form"
                >
                  {t('Save')}
                </Button>
              </ActionListItem>
              <ActionListItem>
                <Button onClick={closeModal} variant="link">
                  {t('Cancel')}
                </Button>
              </ActionListItem>
            </ActionList>
          </StackItem>
        </Stack>
      }
      isOpen={isOpen}
      id="edit-modal"
    >
      <PolicyForm policy={editablePolicy} setPolicy={setEditablePolicy} formId="edit-policy-form" />
    </Modal>
  );
};

export default EditModal;
